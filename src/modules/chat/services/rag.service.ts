// ============================================
// RAG Service
// Document ingestion, semantic search, and retrieval
// Uses pgvector through raw SQL for vector operations
// ============================================

import prisma from "@/lib/prisma";
import { EmbeddingService } from "./embedding.service";

interface DocumentInput {
  title: string;
  content: string;
  category: string;
}

interface SearchResult {
  content: string;
  title: string;
  category: string;
  similarity: number;
}

export class RAGService {
  private static readonly TOP_K = 3;
  private static readonly SIMILARITY_THRESHOLD = 0.7;

  /**
   * Ingest a document: chunk it, generate embeddings, store in DB
   */
  static async ingestDocument(
    doc: DocumentInput,
    tenantId: string
  ): Promise<string> {
    // Create the document record
    const document = await prisma.aiDocument.create({
      data: {
        title: doc.title,
        content: doc.content,
        category: doc.category,
        tenantId,
        isActive: true,
      },
    });

    // Chunk the content
    const chunks = EmbeddingService.chunkDocument(doc.content);

    // Generate embeddings for all chunks
    let embeddings: number[][];
    try {
      embeddings = await EmbeddingService.embedTexts(chunks);
    } catch (error) {
      console.error("[RAG] Error generating embeddings:", error);
      // Still store chunks without embeddings
      for (let i = 0; i < chunks.length; i++) {
        await prisma.aiDocumentChunk.create({
          data: {
            documentId: document.id,
            tenantId,
            chunkIndex: i,
            content: chunks[i],
            tokenCount: EmbeddingService.estimateTokenCount(chunks[i]),
          },
        });
      }
      return document.id;
    }

    // Store chunks with embeddings
    for (let i = 0; i < chunks.length; i++) {
      const chunk = await prisma.aiDocumentChunk.create({
        data: {
          documentId: document.id,
          tenantId,
          chunkIndex: i,
          content: chunks[i],
          tokenCount: EmbeddingService.estimateTokenCount(chunks[i]),
        },
      });

      // Store embedding as raw SQL (pgvector)
      try {
        const vectorStr = `[${embeddings[i].join(",")}]`;
        await prisma.$executeRawUnsafe(
          `UPDATE "AiDocumentChunk" SET embedding = $1::vector WHERE id = $2`,
          vectorStr,
          chunk.id
        );
      } catch (error) {
        console.warn(
          `[RAG] Could not store vector for chunk ${i} (pgvector may not be enabled):`,
          error
        );
      }
    }

    return document.id;
  }

  /**
   * Search for relevant document chunks using vector similarity
   * Falls back to text search if pgvector is not available
   */
  static async searchRelevantContext(
    query: string,
    tenantId: string,
    topK: number = this.TOP_K
  ): Promise<SearchResult[]> {
    try {
      // Try vector search first
      return await this.vectorSearch(query, tenantId, topK);
    } catch (error) {
      console.warn("[RAG] Vector search failed, falling back to text search:", error);
      return this.textSearch(query, tenantId, topK);
    }
  }

  /**
   * Vector similarity search using pgvector
   */
  private static async vectorSearch(
    query: string,
    tenantId: string,
    topK: number
  ): Promise<SearchResult[]> {
    const queryEmbedding = await EmbeddingService.embedText(query);
    const vectorStr = `[${queryEmbedding.join(",")}]`;

    const results: any[] = await prisma.$queryRawUnsafe(
      `SELECT c.content, d.title, d.category,
              1 - (c.embedding <=> $1::vector) as similarity
       FROM "AiDocumentChunk" c
       JOIN "AiDocument" d ON c."documentId" = d.id
       WHERE c."tenantId" = $2
         AND d."isActive" = true
         AND c.embedding IS NOT NULL
         AND 1 - (c.embedding <=> $1::vector) > $3
       ORDER BY c.embedding <=> $1::vector
       LIMIT $4`,
      vectorStr,
      tenantId,
      this.SIMILARITY_THRESHOLD,
      topK
    );

    return results.map((r) => ({
      content: r.content,
      title: r.title,
      category: r.category,
      similarity: Number(r.similarity),
    }));
  }

  /**
   * Fallback: simple text search using ILIKE
   */
  private static async textSearch(
    query: string,
    tenantId: string,
    topK: number
  ): Promise<SearchResult[]> {
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 5);

    if (keywords.length === 0) return [];

    const chunks = await prisma.aiDocumentChunk.findMany({
      where: {
        tenantId,
        document: { isActive: true },
        OR: keywords.map((keyword) => ({
          content: { contains: keyword, mode: "insensitive" as const },
        })),
      },
      include: {
        document: { select: { title: true, category: true } },
      },
      take: topK,
    });

    return chunks.map((c) => ({
      content: c.content,
      title: c.document.title,
      category: c.document.category,
      similarity: 0.5, // approximate
    }));
  }

  /**
   * List all documents for a tenant
   */
  static async listDocuments(tenantId: string) {
    return prisma.aiDocument.findMany({
      where: { tenantId },
      include: {
        _count: { select: { chunks: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Delete a document and all its chunks
   */
  static async deleteDocument(id: string, tenantId: string): Promise<void> {
    await prisma.aiDocument.deleteMany({
      where: { id, tenantId },
    });
  }
}
