"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface KaledChatProps {
  onClose: () => void;
  lessonId?: string;
}

export function KaledChat({ onClose, lessonId }: KaledChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy Kaled, tu tutor del bootcamp. Antes de ayudarte, cuéntame: ¿qué intentaste primero? Un arquitecto siempre intenta antes de pedir ayuda 🎯",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const body: { messages: { role: string; content: string }[]; lessonId?: string } = {
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
      };
      if (lessonId) body.lessonId = lessonId;

      const res = await fetch("/api/academy/ai/kaled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al conectar");
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
        }
      }
      setMessages((prev) => [...prev, { role: "assistant", content: full || "Dame un momento... 🤔" }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Tuve un problema de conexión. ¿Puedes intentar de nuevo?" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        className="relative w-full max-w-lg academy-card-dark rounded-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "70vh" }}
      >
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: "rgba(8,145,178,0.15)" }}
          >
            🤖
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-white">Kaled AI</div>
            <div className="text-[10px] text-emerald-400">● Tutor del Bootcamp</div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05] transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-xl px-3.5 py-2.5 text-[12px] leading-relaxed max-w-[90%] ${
                m.role === "user"
                  ? "ml-auto bg-cyan-600/20 border border-cyan-500/20 text-white"
                  : "bg-white/[0.05] border border-white/[0.06] text-slate-300"
              }`}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="bg-white/[0.05] border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-slate-400 text-[12px] flex items-center gap-2">
              <span className="animate-pulse">●●●</span>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-white/[0.06] flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Pregúntale algo a Kaled..."
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/40 transition-colors"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-xl text-[12px] font-bold text-white disabled:opacity-40 transition-opacity"
            style={{ background: "linear-gradient(135deg, #0891b2, #2563eb)" }}
          >
            Enviar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
