'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import type { PipelineStage } from '../types'

interface FunnelChartProps {
  stages: PipelineStage[]
}

const STAGE_COLORS: Record<string, string> = {
  NUEVO: '#3b82f6',
  CONTACTADO: '#8b5cf6',
  INTERESADO: '#a855f7',
  MASTERCLASS_REGISTRADO: '#d946ef',
  MASTERCLASS_ASISTIO: '#ec4899',
  APLICACION: '#f43f5e',
  LLAMADA_AGENDADA: '#f97316',
  LLAMADA_REALIZADA: '#eab308',
  NEGOCIACION: '#84cc16',
  MATRICULADO: '#22c55e',
  PERDIDO: '#6b7280',
}

export function FunnelChart({ stages }: FunnelChartProps) {
  // Prepare data for chart
  const chartData = stages
    .filter(s => s.stage !== 'PERDIDO') // Exclude PERDIDO from main funnel
    .map(stage => ({
      name: stage.label,
      leads: stage.count,
      fill: STAGE_COLORS[stage.stage] || '#3b82f6'
    }))

  // Calculate conversion rates
  const conversionRates = chartData.map((item, index) => {
    if (index === 0) return { ...item, conversion: 100 }
    const previousCount = chartData[0].leads
    const currentCount = item.leads
    const conversion = previousCount > 0
      ? Math.round((currentCount / previousCount) * 100)
      : 0
    return { ...item, conversion }
  })

  const totalLeads = stages.reduce((sum, s) => sum + s.count, 0)
  const matriculados = stages.find(s => s.stage === 'MATRICULADO')?.count || 0
  const perdidos = stages.find(s => s.stage === 'PERDIDO')?.count || 0
  const conversionRate = totalLeads > 0
    ? Math.round((matriculados / (totalLeads - perdidos)) * 100)
    : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Embudo de Conversión</CardTitle>
            <CardDescription>
              Visualización del flujo de leads por etapa
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{conversionRate}%</div>
            <div className="text-xs text-muted-foreground">Tasa de conversión</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={conversionRates}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{ value: 'Número de Leads', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null
                const data = payload[0].payload
                return (
                  <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold mb-1">{data.name}</p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Leads:</span>{' '}
                      <span className="font-semibold">{data.leads}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Conversión:</span>{' '}
                      <span className="font-semibold">{data.conversion}%</span>
                    </p>
                  </div>
                )
              }}
            />
            <Bar dataKey="leads" radius={[8, 8, 0, 0]}>
              {conversionRates.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalLeads}</div>
            <div className="text-xs text-muted-foreground">Total Leads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stages.find(s => s.stage === 'NUEVO')?.count || 0}
            </div>
            <div className="text-xs text-muted-foreground">Nuevos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{matriculados}</div>
            <div className="text-xs text-muted-foreground">Matriculados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{perdidos}</div>
            <div className="text-xs text-muted-foreground">Perdidos</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
