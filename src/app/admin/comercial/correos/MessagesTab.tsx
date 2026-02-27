'use client';

import { useEffect, useMemo, useState } from 'react';
import { Mail, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type EmailStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'SENT'
  | 'FAILED'
  | 'DELIVERED'
  | 'OPENED'
  | 'CLICKED'
  | 'BOUNCED';

interface MessageItem {
  id: string;
  to: string;
  subject: string;
  status: EmailStatus;
  sentAt: string;
  openedAt: string | null;
  clickedAt: string | null;
  error: string | null;
  template: {
    id: string;
    name: string;
    category: string;
  } | null;
  kaledLead: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    utmCampaign: string | null;
    campaign: {
      id: string;
      name: string;
    } | null;
  } | null;
}

const STATUS_LABEL: Record<EmailStatus, string> = {
  PENDING: 'Pendiente',
  SCHEDULED: 'Programado',
  SENT: 'Enviado',
  FAILED: 'Fallido',
  DELIVERED: 'Entregado',
  OPENED: 'Abierto',
  CLICKED: 'Click',
  BOUNCED: 'Rebotado',
};

const STATUS_CLASS: Record<EmailStatus, string> = {
  PENDING: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  SCHEDULED: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  SENT: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  FAILED: 'bg-red-500/15 text-red-300 border-red-500/30',
  DELIVERED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  OPENED: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  CLICKED: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  BOUNCED: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

const STATUS_OPTIONS: Array<{ value: 'ALL' | EmailStatus; label: string }> = [
  { value: 'ALL', label: 'Todos los estados' },
  ...Object.entries(STATUS_LABEL).map(([value, label]) => ({
    value: value as EmailStatus,
    label,
  })),
];

function formatDate(value: string | null): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function MessagesTab() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | EmailStatus>('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<MessageItem[]>([]);
  const [total, setTotal] = useState(0);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('pageSize', '100');
    if (search.trim()) params.set('search', search.trim());
    if (status !== 'ALL') params.set('status', status);
    return params.toString();
  }, [search, status]);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/kaled-emails?${query}`);
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'No se pudo cargar el historial de correos');
      }
      setItems(payload.data.items ?? []);
      setTotal(payload.data.pagination?.total ?? 0);
    } catch (err: any) {
      setItems([]);
      setTotal(0);
      setError(err.message || 'Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Mensajes a leads</h2>
            <p className="text-sm text-slate-400">
              Historial de envíos con contexto de lead, campaña y plantilla.
            </p>
          </div>
          <Button variant="outline" onClick={loadMessages} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por lead, email, asunto o plantilla..."
              className="pl-9"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as 'ALL' | EmailStatus)}
            className="h-10 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="flex items-center justify-end text-sm text-slate-400">
            Total: <span className="ml-1 font-semibold text-slate-200">{total}</span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Lead</th>
                <th className="px-4 py-3 text-left">Mensaje</th>
                <th className="px-4 py-3 text-left">Plantilla</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Fechas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {!loading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    <Mail className="mx-auto mb-3 h-10 w-10 opacity-35" />
                    No hay mensajes para mostrar con este filtro.
                  </td>
                </tr>
              )}

              {error && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-red-300">
                    {error}
                  </td>
                </tr>
              )}

              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/35">
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-slate-100">{item.kaledLead?.name || '-'}</div>
                    <div className="text-xs text-slate-400">{item.kaledLead?.email || item.to}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      Campaña: {item.kaledLead?.campaign?.name || item.kaledLead?.utmCampaign || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="max-w-[360px] truncate font-medium text-slate-200">{item.subject}</div>
                    <div className="mt-1 text-xs text-slate-500">Destino: {item.to}</div>
                    {item.error && <div className="mt-1 text-xs text-red-300">Error: {item.error}</div>}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="text-slate-200">{item.template?.name || 'Manual'}</div>
                    <div className="text-xs text-slate-500">{item.template?.category || '-'}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Badge className={`border ${STATUS_CLASS[item.status]}`}>
                      {STATUS_LABEL[item.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-slate-400">
                    <div>Enviado: {formatDate(item.sentAt)}</div>
                    <div>Abierto: {formatDate(item.openedAt)}</div>
                    <div>Click: {formatDate(item.clickedAt)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
