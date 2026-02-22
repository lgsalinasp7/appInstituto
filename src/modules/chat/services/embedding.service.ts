// ============================================
// Embedding Service
// Generates embeddings with Google text-embedding-004
// Handles document chunking
// ============================================

import { google } from "@ai-sdk/google";
import { embedMany, embed } from "ai";

export class EmbeddingService {
  private static readonly CHUNK_SIZE = 500; // characters
  private static readonly CHUNK_OVERLAP = 50;

  /**
   * Generate embedding for a single text
   */
  static async embedText(text: string): Promise<number[]> {
    const { embedding } = await embed({
      model: google.textEmbeddingModel("text-embedding-004"),
      value: text,
    });
    return embedding;
  }

  /**
   * Generate embeddings for multiple texts (batched)
   */
  static async embedTexts(texts: string[]): Promise<number[][]> {
    const { embeddings } = await embedMany({
      model: google.textEmbeddingModel("text-embedding-004"),
      values: texts,
    });
    return embeddings;
  }

  /**
   * Split a document into overlapping chunks
   */
  static chunkDocument(
    content: string,
    chunkSize: number = this.CHUNK_SIZE,
    overlap: number = this.CHUNK_OVERLAP
  ): string[] {
    const chunks: string[] = [];
    // Split by paragraphs first for natural boundaries
    const paragraphs = content.split(/\n\s*\n/);
    let currentChunk = "";

    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (!trimmed) continue;

      if ((currentChunk + " " + trimmed).length <= chunkSize) {
        currentChunk = currentChunk ? currentChunk + "\n\n" + trimmed : trimmed;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        // If paragraph itself is too long, split by sentences
        if (trimmed.length > chunkSize) {
          const sentences = trimmed.split(/(?<=[.!?])\s+/);
          currentChunk = "";
          for (const sentence of sentences) {
            if ((currentChunk + " " + sentence).length <= chunkSize) {
              currentChunk = currentChunk
                ? currentChunk + " " + sentence
                : sentence;
            } else {
              if (currentChunk) chunks.push(currentChunk);
              currentChunk = sentence;
            }
          }
        } else {
          currentChunk = trimmed;
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    // Add overlap between chunks
    if (overlap > 0 && chunks.length > 1) {
      const overlappedChunks: string[] = [chunks[0]];
      for (let i = 1; i < chunks.length; i++) {
        const prevEnd = chunks[i - 1].slice(-overlap);
        overlappedChunks.push(prevEnd + " " + chunks[i]);
      }
      return overlappedChunks;
    }

    return chunks;
  }

  /**
   * Estimate token count for a text
   */
  static estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
