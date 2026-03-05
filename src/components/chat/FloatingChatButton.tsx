/**
 * FloatingChatButton - Botón flotante para abrir el chat
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { ChatWindow } from "./ChatWindow";

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  // Solo mostrar en desarrollo si está habilitado
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.NEXT_PUBLIC_AI_ENABLED !== "true"
  ) {
    return null;
  }

  return (
    <>
      {/* Logo flotante - fuera del círculo, más realista */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 cursor-pointer transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg"
        aria-label="Abrir chat"
      >
        <Image
          src="/logo Chatbot.png"
          alt="Chatbot"
          width={64}
          height={64}
          className="object-contain drop-shadow-lg"
        />
      </button>

      {/* Ventana del chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50">
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}
