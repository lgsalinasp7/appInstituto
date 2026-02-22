/**
 * FloatingChatButton - Botón flotante para abrir el chat
 */

"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      {/* Botón flotante */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>

      {/* Ventana del chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50">
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}
