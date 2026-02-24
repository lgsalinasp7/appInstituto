'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, TrendingDown } from 'lucide-react';
import { tenantFetch } from '@/lib/tenant-fetch';
import type { AgentMemoryItem } from '@/modules/agents/types';

export function AgentMemoryManager() {
  const [margyMemories, setMargyMemories] = useState<AgentMemoryItem[]>([]);
  const [kaledMemories, setKaledMemories] = useState<AgentMemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const [margyRes, kaledRes] = await Promise.all([
        tenantFetch('/api/admin/agents/memories?agentType=MARGY'),
        tenantFetch('/api/admin/agents/memories?agentType=KALED'),
      ]);

      const margyData = await margyRes.json();
      const kaledData = await kaledRes.json();

      if (margyData.success) setMargyMemories(margyData.data.slice(0, 10));
      if (kaledData.success) setKaledMemories(kaledData.data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Cargando memorias...</div>
      </div>
    );
  }

  const renderMemoryCard = (memory: AgentMemoryItem) => (
    <Card key={memory.id} className="p-4">
      <div className="flex items-start justify-between mb-2">
        <Badge variant="outline">{memory.category}</Badge>
        <div className="flex items-center gap-1">
          {memory.score >= 70 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : memory.score < 50 ? (
            <TrendingDown className="h-4 w-4 text-red-500" />
          ) : null}
          <span className="text-sm font-semibold">{memory.score}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{memory.content}</p>
      <div className="text-xs text-muted-foreground mt-2">
        {new Date(memory.createdAt).toLocaleDateString()}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Sistema de Memoria
        </h2>
        <p className="text-sm text-muted-foreground">
          Estrategias y lecciones aprendidas por los agentes
        </p>
      </div>

      {/* Margy Memories */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          Memorias de Margy
        </h3>
        {margyMemories.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No hay memorias registradas
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {margyMemories.map(renderMemoryCard)}
          </div>
        )}
      </div>

      {/* Kaled Memories */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500" />
          Memorias de Kaled
        </h3>
        {kaledMemories.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No hay memorias registradas
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {kaledMemories.map(renderMemoryCard)}
          </div>
        )}
      </div>
    </div>
  );
}
