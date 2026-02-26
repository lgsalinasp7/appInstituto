"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Target, Search, Mail, Phone, Calendar, Rocket, ExternalLink, MoreVertical, Edit, History, Trash, RefreshCw, Send } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";
import { LeadHistoryDrawer } from "./LeadHistoryDrawer";
import { EditLeadModal } from "./EditLeadModal";
import { AddNoteModal } from "./AddNoteModal";
import { LogCallModal } from "./LogCallModal";
import { LogMeetingModal } from "./LogMeetingModal";
import SendEmailModal from "./SendEmailModal";
import { toast } from "sonner";
import type { KaledLead } from "@prisma/client";

interface LeadsClientProps {
    initialLeads: any[];
}

const STAGE_COLORS: Record<string, string> = {
    NUEVO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    CONTACTADO: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    DEMO: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    CONVERTIDO: "bg-green-500/10 text-green-400 border-green-500/20",
    PERDIDO: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function LeadsClient({ initialLeads }: LeadsClientProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [leads, setLeads] = useState(initialLeads);
    const [selectedLead, setSelectedLead] = useState<KaledLead | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showAddNote, setShowAddNote] = useState(false);
    const [showLogCall, setShowLogCall] = useState(false);
    const [showLogMeeting, setShowLogMeeting] = useState(false);
    const [showSendEmail, setShowSendEmail] = useState(false);
    const [loading, setLoading] = useState(false);

    const refreshLeads = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/kaled-leads');
            const json = await res.json();
            if (json.success) {
                setLeads(json.data.leads);
            }
        } catch (error) {
            console.error('Error refreshing leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewHistory = (lead: KaledLead) => {
        setSelectedLead(lead);
        setShowHistory(true);
    };

    const handleEdit = (lead: KaledLead) => {
        setSelectedLead(lead);
        setShowEdit(true);
    };

    const handleSendEmail = (lead: KaledLead) => {
        setSelectedLead(lead);
        setShowSendEmail(true);
    };

    const handleDelete = async (lead: KaledLead) => {
        if (!confirm('¿Estás seguro de eliminar este lead? Esta acción se puede revertir.')) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/kaled-leads/${lead.id}`, {
                method: 'DELETE',
            });

            const json = await res.json();

            if (json.success) {
                toast.success('Lead eliminado correctamente');
                refreshLeads();
            } else {
                toast.error(json.error || 'Error al eliminar el lead');
            }
        } catch (error) {
            console.error('Error deleting lead:', error);
            toast.error('Error al eliminar el lead');
        }
    };

    const filteredLeads = leads.filter(lead => {
        const searchLower = searchTerm.toLowerCase();
        return (
            lead.name.toLowerCase().includes(searchLower) ||
            lead.email.toLowerCase().includes(searchLower) ||
            (lead.phone && lead.phone.includes(searchTerm))
        );
    });

    const stats = [
        { title: "Total Leads", value: leads.length, icon: Target, color: "text-cyan-400", bg: "bg-cyan-500/10" },
        { title: "Nuevos", value: leads.filter(l => l.status === 'NUEVO').length, icon: Rocket, color: "text-blue-400", bg: "bg-blue-500/10" },
        { title: "En Seguimiento", value: leads.filter(l => l.status === 'CONTACTADO').length, icon: Phone, color: "text-yellow-400", bg: "bg-yellow-500/10" },
        { title: "Convertidos", value: leads.filter(l => l.status === 'CONVERTIDO').length, icon: ExternalLink, color: "text-green-400", bg: "bg-green-500/10" },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <DashboardHeader
                title="Pipeline"
                titleHighlight="Comercial"
                subtitle="Gestiona los prospectos de Masterclass y servicios directos de KaledSoft."
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
                                <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
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
                        placeholder="Buscar por nombre, email o teléfono..."
                        className="pl-11 pr-4 py-6 bg-slate-950/50 border-slate-800/50 rounded-2xl w-full lg:w-96 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Leads Table */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800/50 bg-slate-900/10">
                                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-slate-500">Prospecto</th>
                                <th className="px-6 py-6 text-xs font-bold uppercase tracking-widest text-slate-500">Estado</th>
                                <th className="px-6 py-6 text-xs font-bold uppercase tracking-widest text-slate-500">Origen / Masterclass</th>
                                <th className="px-6 py-6 text-xs font-bold uppercase tracking-widest text-slate-500">Registro</th>
                                <th className="px-8 py-6 text-right text-xs font-bold uppercase tracking-widest text-slate-500">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30 font-medium">
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center text-cyan-400 font-bold">
                                                {lead.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors uppercase">{lead.name}</div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <Mail className="w-3 h-3 text-cyan-500/50" /> {lead.email}
                                                    {lead.phone && (
                                                        <>
                                                            <span className="text-slate-700 font-normal">•</span>
                                                            <Phone className="w-3 h-3 text-green-500/50" /> {lead.phone}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Badge className={cn("rounded-lg border px-3 py-1 font-bold text-[10px]", STAGE_COLORS[lead.status] || "bg-slate-500/10 text-slate-500")}>
                                            {lead.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-5 focus-within:z-10 relative">
                                        <div className="text-xs text-slate-300 font-bold mb-1 line-clamp-1">{lead.source}</div>
                                        {lead.utmCampaign && (
                                            <div className="text-[10px] text-slate-500 font-normal truncate max-w-[150px]">
                                                Camp: {lead.utmCampaign}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span className="text-xs">
                                                {format(new Date(lead.createdAt), "dd MMM, yyyy", { locale: es })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="glass-card w-48 rounded-xl border-white/10 bg-slate-900/80 text-slate-200 backdrop-blur-xl"
                                            >
                                                <DropdownMenuLabel className="text-xs uppercase tracking-wide text-slate-400">
                                                    Acciones
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleViewHistory(lead)}
                                                    className="cursor-pointer rounded-lg text-slate-200 focus:bg-slate-800/70 focus:text-white"
                                                >
                                                    <History className="mr-2 h-4 w-4" />
                                                    Ver Historial
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleEdit(lead)}
                                                    className="cursor-pointer rounded-lg text-slate-200 focus:bg-slate-800/70 focus:text-white"
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleSendEmail(lead)}
                                                    className="cursor-pointer rounded-lg text-slate-200 focus:bg-slate-800/70 focus:text-white"
                                                >
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Enviar Email
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(lead)}
                                                    className="cursor-pointer rounded-lg text-red-400 focus:bg-red-500/20 focus:text-red-300"
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

                    {filteredLeads.length === 0 && (
                        <div className="py-24 text-center">
                            <Rocket className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-30 animate-pulse" />
                            <h4 className="text-lg font-bold text-white mb-2">Sin Pipeline Activo</h4>
                            <p className="text-slate-500 font-medium">No se han registrado leads en esta sección.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals and Drawers */}
            <LeadHistoryDrawer
                lead={selectedLead}
                open={showHistory}
                onClose={() => {
                    setShowHistory(false);
                    setSelectedLead(null);
                }}
                onRefresh={refreshLeads}
                onAddNote={() => {
                    setShowHistory(false);
                    setShowAddNote(true);
                }}
                onLogCall={() => {
                    setShowHistory(false);
                    setShowLogCall(true);
                }}
                onLogMeeting={() => {
                    setShowHistory(false);
                    setShowLogMeeting(true);
                }}
            />

            <EditLeadModal
                lead={selectedLead}
                open={showEdit}
                onClose={() => {
                    setShowEdit(false);
                    setSelectedLead(null);
                }}
                onSuccess={refreshLeads}
            />

            <AddNoteModal
                leadId={selectedLead?.id || null}
                open={showAddNote}
                onClose={() => {
                    setShowAddNote(false);
                }}
                onSuccess={() => {
                    refreshLeads();
                    setShowHistory(true);
                }}
            />

            <LogCallModal
                leadId={selectedLead?.id || null}
                open={showLogCall}
                onClose={() => {
                    setShowLogCall(false);
                }}
                onSuccess={() => {
                    refreshLeads();
                    setShowHistory(true);
                }}
            />

            <LogMeetingModal
                leadId={selectedLead?.id || null}
                open={showLogMeeting}
                onClose={() => {
                    setShowLogMeeting(false);
                }}
                onSuccess={() => {
                    refreshLeads();
                    setShowHistory(true);
                }}
            />

            <SendEmailModal
                lead={selectedLead}
                open={showSendEmail}
                onClose={() => {
                    setShowSendEmail(false);
                    setSelectedLead(null);
                }}
                onSuccess={() => {
                    refreshLeads();
                    toast.success('Email enviado correctamente');
                }}
            />
        </div>
    );
}
