'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { tenantFetch } from '@/lib/tenant-fetch';
import { Check, AlertCircle, ExternalLink } from 'lucide-react';

export function TelegramConfig() {
  const [chatId, setChatId] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await tenantFetch('/api/admin/telegram/config');
      const data = await res.json();
      if (data.success && data.data?.value) {
        setChatId(data.data.value);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!chatId.trim()) {
      setResult({ success: false, message: 'El Chat ID no puede estar vacío' });
      return;
    }

    setSaving(true);
    setResult(null);

    try {
      const res = await tenantFetch('/api/admin/telegram/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: chatId.trim() }),
      });

      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : { success: false, error: 'Respuesta vacía del servidor' };

      if (data.success) {
        setResult({ success: true, message: 'Configuración guardada exitosamente' });
      } else {
        setResult({ success: false, message: data.error || 'Error al guardar' });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestReport = async () => {
    if (!chatId.trim()) {
      setResult({ success: false, message: 'Guarda el Chat ID antes de probar' });
      return;
    }

    setSaving(true);
    setResult(null);

    try {
      const res = await tenantFetch('/api/admin/telegram/test-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (data.success) {
        setResult({ success: true, message: 'Reporte de prueba enviado a Telegram' });
      } else {
        setResult({ success: false, message: data.error || 'Error al enviar' });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">Cargando configuración...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Telegram</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configura reportes automáticos diarios (09:00 AM) y semanales (lunes 09:00 AM)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-blue-900">📋 Guía de Configuración</h4>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>
              <strong>Crear bot:</strong> Abre Telegram y busca{' '}
              <code className="bg-blue-100 px-1 rounded">@BotFather</code>
            </li>
            <li>
              <strong>Comando:</strong> Envía{' '}
              <code className="bg-blue-100 px-1 rounded">/newbot</code> y sigue las instrucciones
            </li>
            <li>
              <strong>Grupo:</strong> Crea un grupo en Telegram y agrega el bot como administrador
            </li>
            <li>
              <strong>Chat ID:</strong> Busca{' '}
              <code className="bg-blue-100 px-1 rounded">@userinfobot</code>, agrégalo al grupo
              y te mostrará el Chat ID (ejemplo: -100123456789)
            </li>
          </ol>
          <a
            href="https://core.telegram.org/bots/tutorial"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-900"
          >
            Ver guía completa de Telegram
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Input Chat ID */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Chat ID de Telegram</label>
          <Input
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="-100123456789"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            El Chat ID debe comenzar con un guion y números (ej: -100123456789)
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving || !chatId.trim()} className="flex-1">
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
          <Button
            onClick={handleTestReport}
            variant="outline"
            disabled={saving || !chatId.trim()}
          >
            Enviar Prueba
          </Button>
        </div>

        {/* Resultado */}
        {result && (
          <div
            className={`flex items-start gap-2 p-3 rounded ${
              result.success
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {result.success ? (
              <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            )}
            <span className="text-sm">{result.message}</span>
          </div>
        )}

        {/* Información de horarios */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">📅 Horarios de Reportes</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Reporte Diario:</strong> Todos los días a las 09:00 AM</li>
            <li>• <strong>Reporte Semanal:</strong> Todos los lunes a las 09:00 AM</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            Los reportes se envían automáticamente si hay un Chat ID configurado
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
