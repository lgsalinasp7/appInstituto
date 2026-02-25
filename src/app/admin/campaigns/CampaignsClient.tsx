'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Target,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Play,
  Pause,
  CheckCircle,
  Trash,
  BarChart3,
  Users,
  Mail,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DashboardHeader } from '@/modules/dashboard/components/DashboardHeader';
import { toast } from 'sonner';
import type { KaledCampaign } from '@prisma/client';
import { CampaignFormModal } from './CampaignFormModal';

interface CampaignsClientProps {
  initialCampaigns: any[];
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  ACTIVE: 'bg-green-500/10 text-green-400 border-green-500/20',
  PAUSED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  COMPLETED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ARCHIVED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  ACTIVE: 'Activa',
  PAUSED: 'Pausada',
  COMPLETED: 'Completada',
  ARCHIVED: 'Archivada',
};

export default function CampaignsClient({ initialCampaigns }: CampaignsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const refreshCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/campaigns');
      const json = await res.json();
      if (json.success) {
        setCampaigns(json.data);
      }
    } catch (error) {
      console.error('Error refreshing campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCampaign = async (campaign: any) => {
    try {
      const res = await fetch(`/api/admin/campaigns/${campaign.id}/start`, {
        method: 'POST',
      });

      const json = await res.json();

      if (json.success) {
        toast.success('Campaña iniciada correctamente');
        refreshCampaigns();
      } else {
        toast.error(json.error || 'Error al iniciar la campaña');
      }
    } catch (error) {
      console.error('Error starting campaign:', error);
      toast.error('Error al iniciar la campaña');
    }
  };

  const handlePauseCampaign = async (campaign: any) => {
    try {
      const res = await fetch(`/api/admin/campaigns/${campaign.id}/pause`, {
        method: 'POST',
      });

      const json = await res.json();

      if (json.success) {
        toast.success('Campaña pausada correctamente');
        refreshCampaigns();
      } else {
        toast.error(json.error || 'Error al pausar la campaña');
      }
    } catch (error) {
      console.error('Error pausing campaign:', error);
      toast.error('Error al pausar la campaña');
    }
  };

  const handleCompleteCampaign = async (campaign: any) => {
    if (!confirm('¿Estás seguro de completar esta campaña?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/campaigns/${campaign.id}/complete`, {
        method: 'POST',
      });

      const json = await res.json();

      if (json.success) {
        toast.success('Campaña completada correctamente');
        refreshCampaigns();
      } else {
        toast.error(json.error || 'Error al completar la campaña');
      }
    } catch (error) {
      console.error('Error completing campaign:', error);
      toast.error('Error al completar la campaña');
    }
  };

  const handleEdit = (campaign: any) => {
    setSelectedCampaign(campaign);
    setShowForm(true);
  };

  const handleDelete = async (campaign: any) => {
    if (
      !confirm(
        '¿Estás seguro de eliminar esta campaña? Esta acción no se puede deshacer.'
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/campaigns/${campaign.id}`, {
        method: 'DELETE',
      });

      const json = await res.json();

      if (json.success) {
        toast.success('Campaña eliminada correctamente');
        refreshCampaigns();
      } else {
        toast.error(json.error || 'Error al eliminar la campaña');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Error al eliminar la campaña');
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      campaign.name.toLowerCase().includes(searchLower) ||
      (campaign.description && campaign.description.toLowerCase().includes(searchLower))
    );
  });

  const stats = [
    {
      title: 'Total Campañas',
      value: campaigns.length,
      icon: Target,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      title: 'Activas',
      value: campaigns.filter((c) => c.status === 'ACTIVE').length,
      icon: Zap,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Leads Totales',
      value: campaigns.reduce((acc, c) => acc + (c._count?.leads || 0), 0),
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Templates',
      value: campaigns.reduce((acc, c) => acc + (c._count?.templates || 0), 0),
      icon: Mail,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <DashboardHeader
        title="Campañas de"
        titleHighlight="Marketing"
        subtitle="Gestiona las campañas de captación de leads de KaledSoft."
      />

      {/* Stats */}
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
              </div>
              <p className="text-sm font-medium text-slate-400">{stat.title}</p>
              <div className="text-2xl font-bold text-white mt-1">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          <Input
            placeholder="Buscar campañas..."
            className="pl-11 pr-4 py-6 bg-slate-950/50 border-slate-800/50 rounded-2xl w-full lg:w-96 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button
          onClick={() => {
            setSelectedCampaign(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-2xl px-8 py-6 font-bold shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Campaña
        </Button>
      </div>

      {/* Campaigns Table */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/50 bg-slate-900/10">
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Campaña
                </th>
                <th className="px-6 py-6 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Estado
                </th>
                <th className="px-6 py-6 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Leads
                </th>
                <th className="px-6 py-6 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Recursos
                </th>
                <th className="px-6 py-6 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Fecha
                </th>
                <th className="px-8 py-6 text-right text-xs font-bold uppercase tracking-widest text-slate-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30 font-medium">
              {filteredCampaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-8 py-5">
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {campaign.name}
                      </div>
                      {campaign.description && (
                        <div className="text-xs text-slate-500 line-clamp-1 mt-1">
                          {campaign.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge
                      className={cn(
                        'rounded-lg border px-3 py-1 font-bold text-[10px]',
                        STATUS_COLORS[campaign.status] ||
                          'bg-slate-500/10 text-slate-500'
                      )}
                    >
                      {STATUS_LABELS[campaign.status] || campaign.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-300">
                        {campaign._count?.leads || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>
                        <Mail className="w-3 h-3 inline mr-1" />
                        {campaign._count?.templates || 0}
                      </span>
                      <span>
                        <Zap className="w-3 h-3 inline mr-1" />
                        {campaign._count?.sequences || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs text-slate-400">
                      {format(new Date(campaign.createdAt), 'dd MMM, yyyy', {
                        locale: es,
                      })}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-slate-500 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {campaign.status === 'DRAFT' && (
                          <DropdownMenuItem
                            onClick={() => handleStartCampaign(campaign)}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Iniciar
                          </DropdownMenuItem>
                        )}
                        {campaign.status === 'ACTIVE' && (
                          <DropdownMenuItem
                            onClick={() => handlePauseCampaign(campaign)}
                          >
                            <Pause className="mr-2 h-4 w-4" />
                            Pausar
                          </DropdownMenuItem>
                        )}
                        {(campaign.status === 'ACTIVE' ||
                          campaign.status === 'PAUSED') && (
                          <DropdownMenuItem
                            onClick={() => handleCompleteCampaign(campaign)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Completar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleEdit(campaign)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(campaign)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCampaigns.length === 0 && (
            <div className="py-24 text-center">
              <Target className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-30 animate-pulse" />
              <h4 className="text-lg font-bold text-white mb-2">
                Sin Campañas
              </h4>
              <p className="text-slate-500 font-medium">
                No hay campañas registradas.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Form Modal */}
      <CampaignFormModal
        campaign={selectedCampaign}
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedCampaign(null);
        }}
        onSuccess={refreshCampaigns}
      />
    </div>
  );
}
