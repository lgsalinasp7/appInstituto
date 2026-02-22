/**
 * Message - Componente para renderizar un mensaje individual
 */

"use client";

import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: Date;
}

export function Message({ role, content }: MessageProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3 px-4 py-2", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-blue-600"
            : "bg-gradient-to-br from-cyan-500 to-blue-500"
        )}
      >
        {isUser ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        )}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
