'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PipelineFiltersInput } from '../schemas'
import { FUNNEL_STAGE_LABELS, SOURCE_LABELS, TEMPERATURE_LABELS } from '../types'
import { Search, X, Filter } from 'lucide-react'
import type { FunnelStage, LeadSource, LeadTemperature } from '@prisma/client'

interface PipelineFiltersProps {
  onFilterChange: (filters: PipelineFiltersInput) => void
  advisors?: Array<{ id: string; name: string }>
}

export function PipelineFilters({ onFilterChange, advisors = [] }: PipelineFiltersProps) {
  const [filters, setFilters] = useState<PipelineFiltersInput>({})
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (key: keyof PipelineFiltersInput, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilterChange({})
  }

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined).length

  return (
    <div className="space-y-4">
      {/* Search Bar + Toggle */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, teléfono o email..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtros Avanzados</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stage Filter */}
            <div className="space-y-2">
              <Label>Etapa</Label>
              <Select
                value={filters.stage || ''}
                onValueChange={(value) => handleFilterChange('stage', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las etapas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {Object.entries(FUNNEL_STAGE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Temperature Filter */}
            <div className="space-y-2">
              <Label>Temperatura</Label>
              <Select
                value={filters.temperature || ''}
                onValueChange={(value) => handleFilterChange('temperature', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {Object.entries(TEMPERATURE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source Filter */}
            <div className="space-y-2">
              <Label>Fuente</Label>
              <Select
                value={filters.source || ''}
                onValueChange={(value) => handleFilterChange('source', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las fuentes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advisor Filter */}
            {advisors.length > 0 && (
              <div className="space-y-2">
                <Label>Asesor</Label>
                <Select
                  value={filters.advisorId || ''}
                  onValueChange={(value) => handleFilterChange('advisorId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los asesores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {advisors.map((advisor) => (
                      <SelectItem key={advisor.id} value={advisor.id}>
                        {advisor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date From */}
            <div className="space-y-2">
              <Label>Desde</Label>
              <Input
                type="date"
                value={filters.dateFrom ? filters.dateFrom.split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value).toISOString() : undefined
                  handleFilterChange('dateFrom', date)
                }}
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label>Hasta</Label>
              <Input
                type="date"
                value={filters.dateTo ? filters.dateTo.split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value).toISOString() : undefined
                  handleFilterChange('dateTo', date)
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
