'use client';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles } from 'lucide-react';
import { tenantFetch } from '@/lib/tenant-fetch';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface SalesAgentChatProps {
  prospectId?: string | null;
}

export function SalesAgentChat({ prospectId }: SalesAgentChatProps) {
  const [selectedAgent, setSelectedAgent] = useState<'margy' | 'kaled'>('margy');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getSuggestedQuestions = () => {
    if (selectedAgent === 'margy') {
      return [
        '¿Qué leads debo contactar hoy?',
        '¿Cuáles son los leads más calientes?',
        '¿Hay leads que necesiten seguimiento urgente?',
      ];
    } else {
      return [
        '¿Qué campañas están funcionando mejor?',
        '¿Cuál es el CPL promedio de esta semana?',
        '¿Qué estrategia recomiendas para cerrar más ventas?',
      ];
    }
  };

  const handleSubmit = async (e?: React.FormEvent, suggestedQuestion?: string) => {
    e?.preventDefault();
    const messageText = suggestedQuestion || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '' },
    ]);

    try {
      const endpoint =
        selectedAgent === 'margy'
          ? '/api/admin/agents/margy/chat'
          : '/api/admin/agents/kaled/chat';

      const res = await tenantFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          prospectId,
        }),
      });

      if (!res.ok) {
        throw new Error('Error al comunicarse con el agente');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No se pudo leer la respuesta');

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            )
          );
        }
      }
    } catch (error: any) {
      console.error('Error en chat:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: `Lo siento, ocurrió un error al procesar tu mensaje. ${error.message}`,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSubmit(undefined, question);
  };

  return (
    <div className="space-y-4">
      {/* Selector de Agente */}
      <div className="flex gap-2">
        <Button
          variant={selectedAgent === 'margy' ? 'default' : 'outline'}
          onClick={() => {
            setSelectedAgent('margy');
            setMessages([]);
          }}
          className="flex-1"
        >
          <span className="mr-2">🎀</span>
          Margy
        </Button>
        <Button
          variant={selectedAgent === 'kaled' ? 'default' : 'outline'}
          onClick={() => {
            setSelectedAgent('kaled');
            setMessages([]);
          }}
          className="flex-1"
        >
          <span className="mr-2">🎯</span>
          Kaled
        </Button>
      </div>

      {/* Panel de Chat */}
      <Card>
        <CardHeader className={selectedAgent === 'margy' ? 'bg-pink-50' : 'bg-blue-50'}>
          <CardTitle className="flex items-center gap-2">
            {selectedAgent === 'margy' ? (
              <>
                <span>🎀</span>
                <span>Margy - Captación y Calificación</span>
              </>
            ) : (
              <>
                <span>🎯</span>
                <span>Kaled - Estrategia y Cierre</span>
              </>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {selectedAgent === 'margy'
              ? 'Especialista en detectar prioridades y sugerir seguimientos'
              : 'Analista que identifica patrones y recomienda estrategias'}
          </p>
        </CardHeader>
        <CardContent className="p-4">
          {/* Mensajes */}
          <div className="h-[500px] overflow-y-auto mb-4 space-y-3 border rounded p-3 bg-muted/20">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {selectedAgent === 'margy' ? '¡Hola! Soy Margy' : '¡Hola! Soy Kaled'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {selectedAgent === 'margy'
                    ? 'Puedo ayudarte a identificar qué leads contactar, evaluar su temperatura y sugerir el mejor momento para hacer seguimiento.'
                    : 'Puedo analizar el rendimiento de tus campañas, calcular métricas clave y sugerirte estrategias para mejorar tus conversiones.'}
                </p>
                <div className="mt-6 space-y-2 w-full max-w-md">
                  <p className="text-xs font-medium text-muted-foreground">
                    Preguntas sugeridas:
                  </p>
                  {getSuggestedQuestions().map((question, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start"
                      onClick={() => handleSuggestedQuestion(question)}
                      disabled={isLoading}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-lg ${
                      m.role === 'user'
                        ? 'bg-blue-100 ml-auto max-w-[80%]'
                        : selectedAgent === 'margy'
                        ? 'bg-pink-100 mr-auto max-w-[80%]'
                        : 'bg-blue-50 mr-auto max-w-[80%]'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <div className="animate-pulse">●</div>
                <div className="animate-pulse delay-75">●</div>
                <div className="animate-pulse delay-150">●</div>
                <span className="ml-2">
                  {selectedAgent === 'margy' ? 'Margy' : 'Kaled'} está escribiendo...
                </span>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Pregunta a ${selectedAgent === 'margy' ? 'Margy' : 'Kaled'}...`}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
