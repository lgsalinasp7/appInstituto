'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { LeadTemperature } from '@prisma/client'

interface LeadScoreBadgeProps {
  score: number
  temperature: LeadTemperature
  className?: string
}

const TEMPERATURE_COLORS = {
  FRIO: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  TIBIO: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  CALIENTE: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
}

const TEMPERATURE_ICONS = {
  FRIO: '❄️',
  TIBIO: '🌡️',
  CALIENTE: '🔥',
}

export function LeadScoreBadge({ score, temperature, className }: LeadScoreBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        TEMPERATURE_COLORS[temperature],
        'font-semibold',
        className
      )}
    >
      <span className="mr-1">{TEMPERATURE_ICONS[temperature]}</span>
      {score}
    </Badge>
  )
}
