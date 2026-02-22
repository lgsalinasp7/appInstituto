/**
 * ConversationList - Lista de conversaciones anteriores
 */

"use client";

import { MessageSquare, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { ConversationListItem } from "@/modules/chat/types";

interface ConversationListProps {
  conversations: ConversationListItem[];
  isLoading: boolean;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export function ConversationList({
  conversations,
  isLoading,
  onSelectConversation,
  onDeleteConversation,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <MessageSquare className="h-12 w-12 text-gray-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            No hay conversaciones
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Comienza una nueva conversación para ver el historial aquí
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-2 p-4">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className="group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <button
              onClick={() => onSelectConversation(conv.id)}
              className="flex-1 text-left"
            >
              <h4 className="line-clamp-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                {conv.title || "Nueva conversación"}
              </h4>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                <span>{conv.messageCount} mensajes</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(conv.lastMessageAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("¿Eliminar esta conversación?")) {
                  onDeleteConversation(conv.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
