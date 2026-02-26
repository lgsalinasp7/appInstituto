'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { tenantFetch } from '@/lib/tenant-fetch';
import { cn } from '@/lib/utils';
import { CampaignPerformance, StagnantLead } from '../services/cpl-analytics.service';

export function CplDashboard() {
  const [performance, setPerformance] = useState<CampaignPerformance[]>([]);
  const [stagnant, setStagnant] = useState<StagnantLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [perfRes, stagnantRes] = await Promise.all([
        tenantFetch('/api/admin/campaigns/analytics/performance'),
        tenantFetch('/api/admin/campaigns/analytics/stagnant'),
      ]);

      const perf = await perfRes.json();
      const stag = await stagnantRes.json();

      if (perf.success) setPerformance(perf.data);
      if (stag.success) setStagnant(stag.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card flex items-center justify-center rounded-[2rem] border border-slate-800/50 p-12">
        <div className="text-center">
          <div className="text-lg font-medium text-slate-200">Cargando datos...</div>
          <div className="mt-2 text-sm text-slate-500">
            Calculando métricas de campañas
          </div>
        </div>
      </div>
    );
  }

  const avgCpl = performance.length > 0
    ? performance.reduce((acc, p) => acc + p.cpl, 0) / performance.length
    : 0;
  const totalSpend = performance.reduce((acc, p) => acc + p.spend, 0);
  const totalLeads = performance.reduce((acc, p) => acc + p.totalLeads, 0);
  const totalMatriculados = performance.reduce((acc, p) => acc + p.matriculados, 0);

  const getActionBadge = (camp: CampaignPerformance) => {
    if (camp.cpl < avgCpl && camp.conversionRate > 5) {
      return { label: 'Escalar', className: 'bg-green-500/10 text-green-300 border-green-500/30' };
    } else if (camp.cpl > avgCpl * 1.5 || camp.conversionRate < 2) {
      return { label: 'Pausar', className: 'bg-red-500/10 text-red-300 border-red-500/30' };
    }
    return { label: 'Monitorear', className: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' };
  };

  const getTrendIcon = (conversionRate: number) => {
    if (conversionRate > 10) return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (conversionRate < 3) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-yellow-400" />;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="glass-card rounded-[2rem] border-slate-800/50 bg-slate-900/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Gasto Total (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${totalSpend.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {performance.length} campañas activas
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-[2rem] border-slate-800/50 bg-slate-900/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Leads Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalLeads}</div>
            <p className="mt-1 text-xs text-slate-500">
              {totalMatriculados} matriculados
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-[2rem] border-slate-800/50 bg-slate-900/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              CPL Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${Math.round(avgCpl).toLocaleString('es-CO')}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Por lead generado
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-[2rem] border-slate-800/50 bg-slate-900/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Leads Estancados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">
              {stagnant.length}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Sin actualización 7+ días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Rendimiento */}
      <Card className="glass-card rounded-[2.5rem] border-slate-800/50 bg-slate-900/40">
        <CardHeader>
          <CardTitle className="font-display text-xl font-bold tracking-tight text-white">
            Rendimiento por Campaña
          </CardTitle>
          <p className="text-sm text-slate-500">
            Últimos 30 días • Ordenado por total de leads
          </p>
        </CardHeader>
        <CardContent>
          {performance.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No hay datos de campañas disponibles. Importa costos para ver métricas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/50 bg-slate-900/10">
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Campaña</th>
                    <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-500">Gasto</th>
                    <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-500">Leads</th>
                    <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-500">CPL</th>
                    <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-500">Matriculados</th>
                    <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-500">Conv %</th>
                    <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-500">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30 font-medium">
                  {performance.map((camp) => {
                    const action = getActionBadge(camp);
                    return (
                      <tr key={camp.campaign} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="max-w-xs truncate px-4 py-3 font-medium text-white">
                          {camp.campaign}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-300">
                          ${camp.spend.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-300">{camp.totalLeads}</td>
                        <td className="px-4 py-3 text-right text-slate-300">
                          ${Math.round(camp.cpl).toLocaleString('es-CO')}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-300">{camp.matriculados}</td>
                        <td className="px-4 py-3 text-right text-slate-300">
                          <div className="flex items-center justify-end gap-1">
                            {getTrendIcon(camp.conversionRate)}
                            <span>{camp.conversionRate.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge className={cn('rounded-lg border px-3 py-1 text-[10px] font-bold uppercase tracking-widest', action.className)}>
                            {action.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leads Estancados */}
      {stagnant.length > 0 && (
        <Card className="glass-card rounded-[2.5rem] border-slate-800/50 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-xl font-bold tracking-tight text-white">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              Leads Estancados (7+ días sin movimiento)
            </CardTitle>
            <p className="text-sm text-slate-500">
              Estos leads necesitan seguimiento urgente
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stagnant.slice(0, 10).map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/35 p-3 hover:bg-slate-900/50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-slate-100">{lead.name}</div>
                    <div className="text-sm text-slate-500">
                      {lead.phone} • {lead.funnelStage}
                      {lead.advisor && ` • ${lead.advisor}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-300">
                      {lead.daysSinceUpdate} días
                    </Badge>
                    <Badge
                      className={
                        lead.temperature === 'CALIENTE'
                          ? 'bg-red-500/10 text-red-300'
                          : lead.temperature === 'TIBIO'
                          ? 'bg-yellow-500/10 text-yellow-300'
                          : 'bg-blue-500/10 text-blue-300'
                      }
                    >
                      {lead.temperature}
                    </Badge>
                  </div>
                </div>
              ))}
              {stagnant.length > 10 && (
                <div className="pt-2 text-center text-sm text-slate-500">
                  +{stagnant.length - 10} leads estancados adicionales
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
