"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ConversationListItem } from "@/modules/chat/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

export function useChat() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const response = await fetch("/api/chat/conversations");
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (err) {
      console.error("Error cargando conversaciones:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/chat/conversations/${id}`);
      const data = await response.json();
      if (data.success) {
        setActiveConversationId(id);
        setMessages(
          data.data.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: new Date(msg.createdAt),
          }))
        );
      }
    } catch (err) {
      console.error("Error cargando conversación:", err);
    }
  }, []);

  const createNewConversation = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/chat/conversations/${id}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (data.success) {
          if (id === activeConversationId) {
            createNewConversation();
          }
          await loadConversations();
        }
      } catch (err) {
        console.error("Error eliminando conversación:", err);
      }
    },
    [activeConversationId, createNewConversation, loadConversations]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault?.();
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      setError(undefined);

      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", createdAt: new Date() },
      ]);

      try {
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: activeConversationId,
            message: trimmed,
          }),
          signal: controller.signal,
        });

        const newConvId = res.headers.get("X-Conversation-Id");
        if (newConvId && newConvId !== activeConversationId) {
          setActiveConversationId(newConvId);
          loadConversations();
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Error en la respuesta del servidor");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No se pudo leer la respuesta");

        const decoder = new TextDecoder();

        console.log("[useChat] Starting to read stream...");
        let totalChunks = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log(`[useChat] Stream done. Total chunks: ${totalChunks}`);
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          totalChunks++;

          if (chunk) {
            console.log(`[useChat] Chunk ${totalChunks}:`, chunk.substring(0, 100));
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + chunk } : m
              )
            );
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Error en chat:", err);
          setError(err instanceof Error ? err : new Error(String(err)));
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        }
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [input, isLoading, activeConversationId, loadConversations]
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    conversations,
    activeConversationId,
    isLoadingConversations,
    loadConversations,
    loadConversation,
    createNewConversation,
    deleteConversation,
  };
}
