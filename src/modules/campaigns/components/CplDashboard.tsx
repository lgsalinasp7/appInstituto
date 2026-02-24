'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { tenantFetch } from '@/lib/tenant-fetch';
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
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="text-lg font-medium">Cargando datos...</div>
          <div className="text-sm text-muted-foreground mt-2">
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
      return { label: 'Escalar', className: 'bg-green-100 text-green-800 border-green-200' };
    } else if (camp.cpl > avgCpl * 1.5 || camp.conversionRate < 2) {
      return { label: 'Pausar', className: 'bg-red-100 text-red-800 border-red-200' };
    }
    return { label: 'Monitorear', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
  };

  const getTrendIcon = (conversionRate: number) => {
    if (conversionRate > 10) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (conversionRate < 3) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-yellow-600" />;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gasto Total (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalSpend.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {performance.length} campañas activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalMatriculados} matriculados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CPL Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(avgCpl).toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Por lead generado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads Estancados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stagnant.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sin actualización 7+ días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Campaña</CardTitle>
          <p className="text-sm text-muted-foreground">
            Últimos 30 días • Ordenado por total de leads
          </p>
        </CardHeader>
        <CardContent>
          {performance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay datos de campañas disponibles. Importa costos para ver métricas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Campaña</th>
                    <th className="text-right p-3 font-medium">Gasto</th>
                    <th className="text-right p-3 font-medium">Leads</th>
                    <th className="text-right p-3 font-medium">CPL</th>
                    <th className="text-right p-3 font-medium">Matriculados</th>
                    <th className="text-right p-3 font-medium">Conv %</th>
                    <th className="text-right p-3 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.map((camp) => {
                    const action = getActionBadge(camp);
                    return (
                      <tr key={camp.campaign} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium max-w-xs truncate">
                          {camp.campaign}
                        </td>
                        <td className="text-right p-3">
                          ${camp.spend.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-right p-3">{camp.totalLeads}</td>
                        <td className="text-right p-3">
                          ${Math.round(camp.cpl).toLocaleString('es-CO')}
                        </td>
                        <td className="text-right p-3">{camp.matriculados}</td>
                        <td className="text-right p-3">
                          <div className="flex items-center justify-end gap-1">
                            {getTrendIcon(camp.conversionRate)}
                            <span>{camp.conversionRate.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="text-right p-3">
                          <Badge className={action.className}>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Leads Estancados (7+ días sin movimiento)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Estos leads necesitan seguimiento urgente
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stagnant.slice(0, 10).map((lead) => (
                <div
                  key={lead.id}
                  className="flex justify-between items-center p-3 border rounded hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {lead.phone} • {lead.funnelStage}
                      {lead.advisor && ` • ${lead.advisor}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-orange-700 border-orange-300">
                      {lead.daysSinceUpdate} días
                    </Badge>
                    <Badge
                      className={
                        lead.temperature === 'CALIENTE'
                          ? 'bg-red-100 text-red-800'
                          : lead.temperature === 'TIBIO'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }
                    >
                      {lead.temperature}
                    </Badge>
                  </div>
                </div>
              ))}
              {stagnant.length > 10 && (
                <div className="text-center text-sm text-muted-foreground pt-2">
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
