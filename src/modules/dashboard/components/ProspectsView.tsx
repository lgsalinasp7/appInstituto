"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, Search, Phone, Mail, MessageCircle, Edit2, Trash2, ArrowRight, X, Clock, PhoneCall, Send, Calendar, CheckCircle2, Loader2 } from "lucide-react";
import { Pagination } from "./Pagination";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

function getDefaultDate(daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split("T")[0];
}

interface Prospect {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: "CONTACTADO" | "EN_SEGUIMIENTO" | "CERRADO" | "PERDIDO";
  observations: string | null;
  program: { id: string; name: string } | null;
  advisor: { id: string; name: string | null; email: string };
  createdAt: string;
  nextAction?: string | null;
  nextActionDate?: string | null;
}

interface Program {
  id: string;
  name: string;
  totalValue: number;
}

interface Seguimiento {
  id: string;
  prospectId: string;
  type: string;
  result: string;
  date: string;
  notes: string;
  nextAction: string;
}

interface ProspectsViewProps {
  advisorId?: string;
  currentUserId: string;
}

export function ProspectsView({ advisorId, currentUserId }: ProspectsViewProps) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant: "default" | "destructive";
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => { },
    variant: "default",
  });

  const [showForm, setShowForm] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showSeguimientoModal, setShowSeguimientoModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    status: "CONTACTADO",
    observations: "",
    programId: "",
  });

  const fetchProspects = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(programFilter !== "all" && { programId: programFilter }),
        ...(advisorId && { advisorId }),
      });

      const response = await fetch(`/api/prospects?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setProspects(result.data.prospects);
        setTotalItems(result.data.total);
      } else {
        toast.error("Error al cargar prospectos");
      }
    } catch (error) {
      console.error("Error fetching prospects:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, programFilter, advisorId]);

  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/programs");
      const result = await response.json();
      if (result.success) {
        setPrograms(result.data.programs);
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingProspect
        ? `/api/prospects/${editingProspect.id}`
        : "/api/prospects";

      const response = await fetch(url, {
        method: editingProspect ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          advisorId: currentUserId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingProspect ? "Prospecto actualizado" : "Prospecto registrado");
        resetForm();
        fetchProspects();
      } else {
        toast.error(result.error || "Error al guardar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "¿Eliminar prospecto?",
      description: "¿Está seguro de eliminar este prospecto? Esta acción no se puede deshacer.",
      variant: "destructive",
      onConfirm: () => executeDelete(id),
    });
  };

  const executeDelete = async (id: string) => {
    setIsProcessingAction(true);
    try {
      const response = await fetch(`/api/prospects/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        toast.success("Prospecto eliminado");
        fetchProspects();
      } else {
        toast.error("Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsProcessingAction(false);
      setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleEdit = (prospect: Prospect) => {
    setEditingProspect(prospect);
    setFormData({
      name: prospect.name,
      phone: prospect.phone,
      email: prospect.email || "",
      status: prospect.status,
      observations: prospect.observations || "",
      programId: prospect.program?.id || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProspect(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      status: "CONTACTADO",
      observations: "",
      programId: "",
    });
  };

  const handleConvert = async (prospectId: string, data: {
    documentType: string;
    documentNumber: string;
    enrollmentDate: Date;
    initialPayment: number;
    totalProgramValue: number;
  }) => {
    try {
      const response = await fetch(`/api/prospects/${prospectId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        toast.success("¡Prospecto convertido a estudiante!");
        setShowConvertModal(false);
        setSelectedProspect(null);
        fetchProspects();
      } else {
        toast.error(result.error || "Error al convertir");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleSeguimiento = async (data: {
    type: string;
    result: string;
    notes: string;
    nextAction: string;
    nextActionDate: string;
  }) => {
    if (!selectedProspect) return;

    try {
      const response = await fetch(`/api/prospects/${selectedProspect.id}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: data.type.toUpperCase(), // Backend expects enum
          content: data.notes || data.result,
          advisorId: currentUserId,
          date: new Date().toISOString(),
        }),
      });
      const result = await response.json();

      if (result.success) {
        toast.success("Seguimiento registrado");
        setShowSeguimientoModal(false);
        setSelectedProspect(null);
        fetchProspects();
      } else {
        toast.error(result.error || "Error al registrar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "CONTACTADO":
        return "bg-blue-100 text-blue-800";
      case "EN_SEGUIMIENTO":
        return "bg-yellow-100 text-yellow-800";
      case "CERRADO":
        return "bg-green-100 text-green-800";
      case "PERDIDO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CONTACTADO":
        return "Contactado";
      case "EN_SEGUIMIENTO":
        return "En Seguimiento";
      case "CERRADO":
        return "Cerrado";
      case "PERDIDO":
        return "Perdido";
      default:
        return status;
    }
  };

  const [stats, setStats] = useState({
    total: 0,
    contactado: 0,
    enSeguimiento: 0,
    cerrado: 0,
    perdido: 0,
    conversionRate: 0,
  });

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/prospects/stats${advisorId ? `?advisorId=${advisorId}` : ""}`);
      const result = await response.json();
      if (result.success) {
        const byStatus = result.data.byStatus;
        setStats({
          total: result.data.total,
          contactado: byStatus.find((s: any) => s.status === "CONTACTADO")?.count || 0,
          enSeguimiento: byStatus.find((s: any) => s.status === "EN_SEGUIMIENTO")?.count || 0,
          cerrado: byStatus.find((s: any) => s.status === "CERRADO")?.count || 0,
          perdido: byStatus.find((s: any) => s.status === "PERDIDO")?.count || 0,
          conversionRate: result.data.conversionRate,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [prospects]); // Refresh stats when prospects change

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-primary">{stats.total}</p>
          <p className="text-xs text-gray-500 font-medium">Total</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-2xl font-bold text-blue-700">{stats.contactado}</p>
          <p className="text-xs text-blue-600 font-medium">Contactados</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
          <p className="text-2xl font-bold text-yellow-700">{stats.enSeguimiento}</p>
          <p className="text-xs text-yellow-600 font-medium">En Seguimiento</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-2xl font-bold text-green-700">{stats.cerrado}</p>
          <p className="text-xs text-green-600 font-medium">Cerrados</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <p className="text-2xl font-bold text-red-700">{stats.perdido}</p>
          <p className="text-xs text-red-600 font-medium">Perdidos</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-2xl font-bold">{stats.conversionRate}%</p>
          <p className="text-xs opacity-90 font-medium">Tasa de Cierre</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, teléfono o email..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Todos los estados</option>
                <option value="CONTACTADO">Contactados</option>
                <option value="EN_SEGUIMIENTO">En Seguimiento</option>
                <option value="CERRADO">Cerrados</option>
                <option value="PERDIDO">Perdidos</option>
              </select>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors flex items-center gap-2 font-medium"
            >
              <UserPlus size={18} />
              Nuevo Prospecto
            </button>
          </div>
        </div>

        <div className="hidden lg:block overflow-x-auto relative min-h-[400px]">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Prospecto</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Programa</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Próxima Acción</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Asesor</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prospects.map((prospect) => (
                <tr key={prospect.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-primary">{prospect.name}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone size={12} />
                          {prospect.phone}
                        </span>
                        {prospect.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={12} />
                            {prospect.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {prospect.program ? (
                      <span className="text-sm font-medium">{prospect.program.name}</span>
                    ) : (
                      <span className="text-sm text-gray-400">Sin definir</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyles(prospect.status)}`}>
                      {getStatusLabel(prospect.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {prospect.nextAction && prospect.nextActionDate ? (
                      <div className="text-sm">
                        <p className="font-medium text-primary">{prospect.nextAction}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(prospect.nextActionDate).toLocaleDateString("es-CO")}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{prospect.advisor.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <a
                        href={`https://wa.me/57${prospect.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="WhatsApp"
                      >
                        <MessageCircle size={18} />
                      </a>
                      <button
                        onClick={() => {
                          setSelectedProspect(prospect);
                          setShowSeguimientoModal(true);
                        }}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Registrar seguimiento"
                      >
                        <Clock size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProspect(prospect);
                          setShowHistorialModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Ver historial"
                      >
                        <Calendar size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(prospect)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      {prospect.status !== "CERRADO" && prospect.program && (
                        <button
                          onClick={() => {
                            setSelectedProspect(prospect);
                            setShowConvertModal(true);
                          }}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="Convertir a estudiante"
                        >
                          <ArrowRight size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(prospect.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden divide-y divide-gray-100">
          {prospects.map((prospect) => (
            <div key={prospect.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-primary">{prospect.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusStyles(prospect.status)}`}>
                      {getStatusLabel(prospect.status)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Phone size={12} />
                      {prospect.phone}
                    </span>
                    {prospect.program && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">
                        {prospect.program.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {prospect.nextAction && prospect.nextActionDate && (
                <div className="bg-blue-50 rounded-lg p-2 mb-2 text-xs">
                  <span className="font-medium text-blue-800">{prospect.nextAction}</span>
                  <span className="text-blue-600"> - {new Date(prospect.nextActionDate).toLocaleDateString("es-CO")}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-1">
                <a
                  href={`https://wa.me/57${prospect.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-green-600"
                >
                  <MessageCircle size={18} />
                </a>
                <button
                  onClick={() => { setSelectedProspect(prospect); setShowSeguimientoModal(true); }}
                  className="p-2 text-purple-600"
                >
                  <Clock size={18} />
                </button>
                <button onClick={() => handleEdit(prospect)} className="p-2 text-primary">
                  <Edit2 size={18} />
                </button>
                {prospect.status !== "CERRADO" && prospect.program && (
                  <button
                    onClick={() => { setSelectedProspect(prospect); setShowConvertModal(true); }}
                    className="p-2 text-emerald-600"
                  >
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {(!isLoading && prospects.length === 0) ? (
          <div className="p-12 text-center">
            <UserPlus size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-primary mb-2">Sin prospectos</h3>
            <p className="text-gray-500">No se encontraron prospectos con los filtros aplicados</p>
          </div>
        ) : (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / itemsPerPage)}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(items) => { setItemsPerPage(items); setCurrentPage(1); }}
          />
        )}
      </div>

      {showForm && (
        <ProspectFormModal
          formData={formData}
          setFormData={setFormData}
          programs={programs}
          isEditing={!!editingProspect}
          onSubmit={handleSubmit}
          onClose={resetForm}
        />
      )}

      {showConvertModal && selectedProspect && (
        <ConvertModal
          prospect={selectedProspect}
          programs={programs}
          onClose={() => { setShowConvertModal(false); setSelectedProspect(null); }}
          onConvert={handleConvert}
        />
      )}

      {showSeguimientoModal && selectedProspect && (
        <SeguimientoModal
          prospect={selectedProspect}
          onClose={() => { setShowSeguimientoModal(false); setSelectedProspect(null); }}
          onSubmit={handleSeguimiento}
        />
      )}

      {showHistorialModal && selectedProspect && (
        <HistorialSeguimientosModal
          prospect={selectedProspect}
          onClose={() => { setShowHistorialModal(false); setSelectedProspect(null); }}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant={confirmConfig.variant}
        isLoading={isProcessingAction}
        confirmText={confirmConfig.variant === "destructive" ? "Eliminar" : "Confirmar"}
      />
    </div>
  );
}

function ProspectFormModal({
  formData,
  setFormData,
  programs,
  isEditing,
  onSubmit,
  onClose,
}: {
  formData: { name: string; phone: string; email: string; status: string; observations: string; programId: string };
  setFormData: (data: typeof formData) => void;
  programs: Program[];
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-primary p-6 text-white relative rounded-t-2xl">
          <button onClick={onClose} className="absolute right-4 top-4 text-white/70 hover:text-white">
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            <UserPlus size={28} />
            <h3 className="text-lg font-bold">{isEditing ? "Editar Prospecto" : "Nuevo Prospecto"}</h3>
          </div>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="300 123 4567"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Programa de Interés</label>
            <select
              value={formData.programId}
              onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Seleccionar programa</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="CONTACTADO">Contactado</option>
              <option value="EN_SEGUIMIENTO">En Seguimiento</option>
              <option value="CERRADO">Cerrado</option>
              <option value="PERDIDO">Perdido</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              rows={3}
              placeholder="Notas sobre el prospecto..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg font-medium hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-light">
              {isEditing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SeguimientoModal({
  prospect,
  onClose,
  onSubmit,
}: {
  prospect: Prospect;
  onClose: () => void;
  onSubmit: (data: { type: string; result: string; notes: string; nextAction: string; nextActionDate: string }) => void;
}) {
  const [type, setType] = useState("Llamada");
  const [result, setResult] = useState("Interesado");
  const [notes, setNotes] = useState("");
  const [nextAction, setNextAction] = useState("Llamar");
  const [nextActionDate, setNextActionDate] = useState(() => getDefaultDate(3));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({ type, result, notes, nextAction, nextActionDate });
      setIsSubmitting(false);
    }, 600);
  };

  const typeOptions = [
    { value: "Llamada", icon: PhoneCall, color: "blue" },
    { value: "WhatsApp", icon: MessageCircle, color: "green" },
    { value: "Email", icon: Send, color: "purple" },
    { value: "Visita", icon: Calendar, color: "orange" },
  ];

  const resultOptions = [
    { value: "Interesado", color: "green" },
    { value: "No contesta", color: "gray" },
    { value: "Reagendar", color: "yellow" },
    { value: "No interesado", color: "red" },
    { value: "En espera", color: "blue" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-purple-600 p-6 text-white relative rounded-t-2xl">
          <button onClick={onClose} className="absolute right-4 top-4 text-white/70 hover:text-white">
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            <Clock size={28} />
            <div>
              <h3 className="text-lg font-bold">Registrar Seguimiento</h3>
              <p className="text-sm text-purple-200">{prospect.name}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Contacto *</label>
            <div className="grid grid-cols-4 gap-2">
              {typeOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${type === opt.value
                      ? `border-${opt.color}-500 bg-${opt.color}-50 text-${opt.color}-600`
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                  >
                    <Icon size={20} />
                    <span className="text-xs font-medium">{opt.value}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resultado *</label>
            <div className="flex flex-wrap gap-2">
              {resultOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setResult(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${result === opt.value
                    ? `bg-${opt.color}-100 text-${opt.color}-800 ring-2 ring-${opt.color}-500`
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {opt.value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas del Contacto</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="¿Qué se habló? ¿Qué preguntas tiene?"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
            />
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm font-bold text-blue-900 mb-3">Próxima Acción</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-blue-800 mb-1">Acción</label>
                <select
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Llamar">Llamar</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                  <option value="Visita">Visita</option>
                  <option value="Esperar respuesta">Esperar respuesta</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-800 mb-1">Fecha</label>
                <input
                  type="date"
                  value={nextActionDate}
                  onChange={(e) => setNextActionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg font-medium hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function HistorialSeguimientosModal({
  prospect,
  onClose,
}: {
  prospect: Prospect;
  onClose: () => void;
}) {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const response = await fetch(`/api/prospects/${prospect.id}/interactions`);
        const result = await response.json();
        if (result.success) {
          setInteractions(result.data);
        }
      } catch (error) {
        console.error("Error fetching interactions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInteractions();
  }, [prospect.id]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="bg-blue-600 p-6 text-white relative rounded-t-2xl">
          <button onClick={onClose} className="absolute right-4 top-4 text-white/70 hover:text-white">
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            <Calendar size={28} />
            <div>
              <h3 className="text-lg font-bold">Historial de Seguimientos</h3>
              <p className="text-sm text-blue-200">{prospect.name}</p>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[500px]">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : interactions.length === 0 ? (
            <div className="p-8 text-center">
              <Clock size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No hay seguimientos registrados aún</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {interactions.map((s) => (
                <div key={s.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase tracking-wider">
                      {s.type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(s.date).toLocaleString("es-CO", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{s.content}</p>
                  <p className="text-[10px] text-gray-400">Registrado por: {s.advisor.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function ConvertModal({
  prospect,
  programs,
  onClose,
  onConvert,
}: {
  prospect: Prospect;
  programs: Program[];
  onClose: () => void;
  onConvert: (prospectId: string, data: {
    documentType: string;
    documentNumber: string;
    enrollmentDate: Date;
    initialPayment: number;
    totalProgramValue: number;
  }) => void;
}) {
  const program = programs.find((p) => p.id === prospect.program?.id);
  const [data, setData] = useState({
    documentType: "CC",
    documentNumber: "",
    enrollmentDate: new Date().toISOString().split("T")[0],
    initialPayment: 350000,
    totalProgramValue: program?.totalValue || 0,
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="bg-emerald-600 p-6 text-white relative rounded-t-2xl">
          <button onClick={onClose} className="absolute right-4 top-4 text-white/70 hover:text-white">
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            <CheckCircle2 size={28} />
            <div>
              <h3 className="text-lg font-bold">Convertir a Estudiante</h3>
              <p className="text-sm text-emerald-200">{prospect.name}</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
            <p className="text-sm font-bold text-emerald-900">{prospect.program?.name}</p>
            <p className="text-xs text-emerald-700">Valor: ${data.totalProgramValue.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Doc.</label>
              <select
                value={data.documentType}
                onChange={(e) => setData({ ...data, documentType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="CC">CC</option>
                <option value="TI">TI</option>
                <option value="CE">CE</option>
                <option value="PP">Pasaporte</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
              <input
                type="text"
                value={data.documentNumber}
                onChange={(e) => setData({ ...data, documentNumber: e.target.value })}
                placeholder="1234567890"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Matrícula</label>
            <input
              type="date"
              value={data.enrollmentDate}
              onChange={(e) => setData({ ...data, enrollmentDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pago Inicial</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                value={data.initialPayment}
                onChange={(e) => setData({ ...data, initialPayment: Number(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Saldo después de matrícula:</span>
              <span className="font-bold text-primary">${(data.totalProgramValue - data.initialPayment).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg font-medium hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={() => onConvert(prospect.id, { ...data, enrollmentDate: new Date(data.enrollmentDate) })}
            disabled={!data.documentNumber}
            className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            Matricular
          </button>
        </div>
      </div>
    </div>
  );
}
