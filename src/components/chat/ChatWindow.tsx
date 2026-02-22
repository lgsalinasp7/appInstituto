/**
 * ChatWindow - Ventana principal del chat
 */

"use client";

import { useState } from "react";
import { X, History, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ConversationList } from "./ConversationList";
import { useChat } from "@/hooks/useChat";

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const [showHistory, setShowHistory] = useState(false);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    conversations,
    isLoadingConversations,
    loadConversation,
    createNewConversation,
    deleteConversation,
  } = useChat();

  const handleSelectConversation = (id: string) => {
    loadConversation(id);
    setShowHistory(false);
  };

  const handleNewConversation = () => {
    createNewConversation();
    setShowHistory(false);
  };

  return (
    <Card className="flex h-[600px] w-[400px] flex-col overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-gradient-to-r from-blue-600 to-cyan-500 p-4 text-white">
        <h2 className="text-lg font-semibold">Asistente KaledSoft</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setShowHistory(!showHistory)}
            title={showHistory ? "Ver chat" : "Ver historial"}
          >
            <History className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={handleNewConversation}
            title="Nueva conversación"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {showHistory ? (
          <ConversationList
            conversations={conversations}
            isLoading={isLoadingConversations}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={deleteConversation}
          />
        ) : (
          <>
            <MessageList messages={messages} isLoading={isLoading} />
            <MessageInput
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </>
        )}
      </div>
    </Card>
  );
}
