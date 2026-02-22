/**
 * MessageList - Lista de mensajes con auto-scroll
 */

"use client";

import { useEffect, useRef } from "react";
import { Message } from "./Message";
import { TypingIndicator } from "./TypingIndicator";
import { Bot } from "lucide-react";
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500">
          <Bot className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ¡Hola! Soy tu asistente KaledSoft
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Puedo ayudarte a consultar información sobre estudiantes, programas, recaudos y cartera.
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            ¿En qué puedo ayudarte hoy?
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-1 overflow-y-auto">
      {messages.map((message) => (
        <Message key={message.id} role={message.role} content={message.content} />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}
