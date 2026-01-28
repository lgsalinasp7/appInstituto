"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Program {
  id: string;
  name: string;
  description: string | null;
  totalValue: number;
  isActive: boolean;
  _count?: {
    students: number;
    prospects: number;
  };
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    totalValue: "",
    isActive: true,
  });

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

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/programs?includeInactive=true");
      const data = await response.json();
      if (data.success) {
        setPrograms(data.data.programs);
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingProgram
      ? `/api/programs/${editingProgram.id}`
      : "/api/programs";

    const method = editingProgram ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          totalValue: Number(formData.totalValue),
          isActive: formData.isActive,
        }),
      });

      if (response.ok) {
        fetchPrograms();
        resetForm();
      }
    } catch (error) {
      console.error("Error saving program:", error);
    }
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      description: program.description || "",
      totalValue: String(program.totalValue),
      isActive: program.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "¿Eliminar programa?",
      description: "¿Está seguro de eliminar este programa? Esta acción no se puede deshacer y puede afectar a estudiantes matriculados.",
      variant: "destructive",
      onConfirm: () => executeDelete(id),
    });
  };

  const executeDelete = async (id: string) => {
    setIsProcessingAction(true);
    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchPrograms();
      } else {
        const data = await response.json();
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error("Error de conexión");
    } finally {
      setIsProcessingAction(false);
      setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProgram(null);
    setFormData({
      name: "",
      description: "",
      totalValue: "",
      isActive: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-[#1e3a5f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Programas Académicos</h2>
          <p className="text-muted-foreground">
            Gestiona los programas disponibles en la institución
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus size={18} />
          Nuevo Programa
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProgram ? "Editar Programa" : "Nuevo Programa"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Bachillerato Acelerado"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Valor Total *</label>
                  <Input
                    type="number"
                    value={formData.totalValue}
                    onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                    placeholder="650000"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del programa"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm">Programa activo</label>
              </div>
              <div className="flex gap-3">
                <Button type="submit">
                  {editingProgram ? "Actualizar" : "Crear Programa"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((program) => (
          <Card key={program.id} className={!program.isActive ? "opacity-60" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{program.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(program)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(program.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              {program.description && (
                <p className="text-sm text-muted-foreground">{program.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[#1e3a5f]">
                  <DollarSign size={18} />
                  <span className="font-bold text-lg">
                    ${program.totalValue.toLocaleString()}
                  </span>
                </div>
                <Badge variant={program.isActive ? "default" : "secondary"}>
                  {program.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{program._count?.students || 0} estudiantes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {programs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No hay programas registrados. Crea el primer programa.
            </p>
          </CardContent>
        </Card>
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
