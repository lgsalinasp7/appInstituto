'use client';

import { useState } from 'react';
import {
  TrendingUp,
  Users,
  Clock,
  Zap,
  Target,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardHeader } from '@/modules/dashboard/components/DashboardHeader';
import KaledAnalyticsCharts from './KaledAnalyticsCharts';

interface AnalyticsData {
  overview: {
    totalLeads: number;
    conversionRate: number;
    avgTimeToConversion: number;
    responseVelocity: number;
  };
  conversion: {
    byStage: Record<string, number>;
    timeline: Array<{ date: string; count: number }>;
    byCampaign: Array<{ name: string; count: number }>;
  };
}

interface KaledAnalyticsClientProps {
  data: AnalyticsData;
}

export default function KaledAnalyticsClient({
  data,
}: KaledAnalyticsClientProps) {
  const { overview, conversion } = data;

  const stats = [
    {
      title: 'Total Leads',
      value: overview.totalLeads,
      icon: Users,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      change: '+12%',
    },
    {
      title: 'Tasa de Conversión',
      value: `${overview.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      change: '+5.2%',
    },
    {
      title: 'Tiempo Promedio',
      value: `${Math.round(overview.avgTimeToConversion)} días`,
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      change: '-2 días',
    },
    {
      title: 'Velocidad de Respuesta',
      value: `${Math.round(overview.responseVelocity)} hrs`,
      icon: Zap,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      change: '-1.5 hrs',
    },
  ];

  const hasData = overview.totalLeads > 0;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <DashboardHeader
        title="Analytics"
        titleHighlight="CRM"
        subtitle="Métricas y análisis del pipeline comercial de KaledLeads"
      />

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="glass-card rounded-[2rem] p-6 glass-card-hover"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn('p-3 rounded-2xl', stat.bg, stat.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs text-green-400 font-semibold">
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-400">
                {stat.title}
              </p>
              <div className="text-2xl font-bold text-white mt-1">
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      {hasData ? (
        <KaledAnalyticsCharts
          byStage={conversion.byStage}
          timeline={conversion.timeline}
          byCampaign={conversion.byCampaign}
        />
      ) : (
        <div className="glass-card rounded-[2.5rem] p-12 text-center">
          <Activity className="h-16 w-16 mx-auto mb-4 opacity-30 text-slate-500" />
          <p className="text-slate-400 text-lg font-medium">
            No hay suficientes datos para mostrar métricas
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Una vez que tengas más leads, las métricas se mostrarán aquí
          </p>
        </div>
      )}
    </div>
  );
}
