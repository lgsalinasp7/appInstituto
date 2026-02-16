"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, Edit, Trash2, Check, X, BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatCurrency, parseCurrency } from "@/lib/utils";
import type { Program } from "@/modules/programs/types";

interface NewProgramForm {
    name: string;
    matriculaValue: number;
    totalValue: number;
    modulesCount: number;
    description?: string;
}

const emptyNewProgram: NewProgramForm = {
    name: "",
    matriculaValue: 0,
    totalValue: 0,
    modulesCount: 1,
    description: "",
};

export function ProgramManager() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Program>>({});
    const [isCreating, setIsCreating] = useState(false);
    const [newProgram, setNewProgram] = useState<NewProgramForm>(emptyNewProgram);

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
        setLoading(true);
        try {
            const res = await fetch("/api/programs");
            const data = await res.json();
            if (data.success) {
                setPrograms(data.data.programs);
            }
        } catch {
            toast.error("Error al cargar programas");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (p: Program) => {
        setIsEditing(p.id);
        setEditForm(p);
    };

    const handleSave = async () => {
        if (!editForm.id) return;

        // Validación básica antes de enviar
        if (!editForm.name || editForm.name.length < 2) {
            toast.error("El nombre debe tener al menos 2 caracteres");
            return;
        }
        if (Number(editForm.modulesCount) < 1) {
            toast.error("La cantidad de módulos debe ser al menos 1");
            return;
        }

        try {
            const res = await fetch(`/api/programs/${editForm.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm)
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Programa actualizado exitosamente");
                setIsEditing(null);
                fetchPrograms();
            } else {
                toast.error(data.error || "Error al actualizar el programa");
                if (data.details) {
                    console.error("Detalles de validación:", data.details);
                }
            }
        } catch (error) {
            console.error("Error saving program:", error);
            toast.error("Error de red al actualizar");
        }
    };

    const handleCreateProgram = async () => {
        // Validación básica antes de enviar
        if (!newProgram.name || newProgram.name.length < 2) {
            toast.error("El nombre debe tener al menos 2 caracteres");
            return;
        }
        if (newProgram.modulesCount < 1) {
            toast.error("La cantidad de módulos debe ser al menos 1");
            return;
        }
        if (newProgram.totalValue <= 0) {
            toast.error("El valor total debe ser mayor a 0");
            return;
        }

        try {
            const res = await fetch("/api/programs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProgram)
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Programa creado exitosamente");
                setIsCreating(false);
                setNewProgram(emptyNewProgram);
                fetchPrograms();
            } else {
                toast.error(data.error || "Error al crear el programa");
                if (data.details) {
                    console.error("Detalles de validación:", data.details);
                }
            }
        } catch (error) {
            console.error("Error creating program:", error);
            toast.error("Error de red al crear programa");
        }
    };

    const handleCancelCreate = () => {
        setIsCreating(false);
        setNewProgram(emptyNewProgram);
    };

    const handleDelete = (id: string) => {
        setConfirmConfig({
            isOpen: true,
            title: "¿Eliminar programa?",
            description: "Esta acción no se puede deshacer y eliminará permanentemente el programa.",
            variant: "destructive",
            onConfirm: () => executeDelete(id),
        });
    };

    const executeDelete = async (id: string) => {
        setIsProcessingAction(true);
        try {
            const res = await fetch(`/api/programs/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Programa eliminado exitosamente");
                fetchPrograms();
            } else {
                toast.error(data.error || "Error al eliminar el programa");
            }
        } catch (error) {
            console.error("Error deleting program:", error);
            toast.error("Error de red al intentar eliminar");
        } finally {
            setIsProcessingAction(false);
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h3 className="font-black text-[#1e3a5f] flex items-center gap-2">
                        <BookOpen size={20} className="text-primary" />
                        Programas Académicos
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">Administra el catálogo de programas y sus costos</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    disabled={isCreating}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/10 transition-all active:scale-95"
                >
                    <Plus size={18} /> Nuevo Programa
                </button>
            </div>

            {isCreating && (
                <div className="bg-blue-50/50 p-4 sm:p-6 rounded-2xl border border-blue-100 animate-fade-in-up">
                    <h4 className="font-bold text-[#1e3a5f] mb-4 text-sm flex items-center gap-2">
                        <Plus size={16} /> Configurar Nuevo Programa
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Nombre</label>
                            <input
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-[#1e3a5f]"
                                placeholder="Ej: Técnico en Sistemas"
                                value={newProgram.name}
                                onChange={e => setNewProgram({ ...newProgram, name: e.target.value })}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Matrícula ($)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                                <input
                                    type="text"
                                    className="w-full pl-7 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-[#1e3a5f]"
                                    placeholder="0"
                                    value={formatCurrency(newProgram.matriculaValue)}
                                    onChange={e => setNewProgram({ ...newProgram, matriculaValue: parseCurrency(e.target.value) })}
                                    onFocus={e => e.target.select()}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Total ($)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                                <input
                                    type="text"
                                    className="w-full pl-7 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-[#1e3a5f]"
                                    placeholder="0"
                                    value={formatCurrency(newProgram.totalValue)}
                                    onChange={e => setNewProgram({ ...newProgram, totalValue: parseCurrency(e.target.value) })}
                                    onFocus={e => e.target.select()}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Módulos</label>
                            <div className="flex items-center gap-1 border rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-primary/20">
                                <button
                                    type="button"
                                    onClick={() => setNewProgram({ ...newProgram, modulesCount: Math.max(1, newProgram.modulesCount - 1) })}
                                    className="p-2.5 bg-gray-100 hover:bg-gray-200 text-[#1e3a5f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    disabled={newProgram.modulesCount <= 1}
                                    aria-label="Disminuir módulos"
                                >
                                    <Minus size={16} />
                                </button>
                                <input
                                    type="number"
                                    min={1}
                                    className="w-14 py-2 text-center text-sm font-bold text-[#1e3a5f] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    value={newProgram.modulesCount}
                                    onChange={e => {
                                        const v = parseInt(e.target.value, 10);
                                        if (!isNaN(v) && v >= 1) setNewProgram({ ...newProgram, modulesCount: v });
                                    }}
                                    onFocus={e => e.target.select()}
                                />
                                <button
                                    type="button"
                                    onClick={() => setNewProgram({ ...newProgram, modulesCount: newProgram.modulesCount + 1 })}
                                    className="p-2.5 bg-gray-100 hover:bg-gray-200 text-[#1e3a5f] transition-colors"
                                    aria-label="Aumentar módulos"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-blue-100/50">
                        <button
                            onClick={handleCancelCreate}
                            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCreateProgram}
                            className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200"
                        >
                            Guardar Programa
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="animate-spin mx-auto text-primary mb-4" size={32} />
                        <p className="text-gray-400 font-medium">Cargando catálogo...</p>
                    </div>
                ) : programs.length === 0 ? (
                    <div className="p-12 text-center bg-gray-50/50">
                        <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-500 font-bold text-lg">No hay programas registrados</p>
                        <p className="text-sm text-gray-400 mt-1">Comienza agregando tu primer programa académico.</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile View: Cards */}
                        <div className="md:hidden divide-y divide-gray-50">
                            {programs.map(p => (
                                <div key={p.id} className="p-4 hover:bg-gray-50/50 transition-colors space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0 flex-1 mr-3">
                                            {isEditing === p.id ? (
                                                <input
                                                    className="w-full px-3 py-1.5 border rounded-lg text-sm font-bold text-[#1e3a5f] focus:ring-2 focus:ring-primary/20 outline-none"
                                                    value={editForm.name}
                                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                />
                                            ) : (
                                                <h4 className="font-black text-[#1e3a5f] truncate">{p.name}</h4>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            {isEditing === p.id ? (
                                                <>
                                                    <button onClick={handleSave} className="p-2 text-emerald-600 bg-emerald-50 rounded-lg">
                                                        <Check size={16} />
                                                    </button>
                                                    <button onClick={() => setIsEditing(null)} className="p-2 text-red-600 bg-red-50 rounded-lg">
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEditClick(p)} className="p-2 text-primary bg-blue-50 rounded-lg">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-400 bg-red-50/50 rounded-lg">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">Matrícula</span>
                                            {isEditing === p.id ? (
                                                <input
                                                    type="text"
                                                    className="w-full bg-transparent text-xs font-bold text-[#1e3a5f] outline-none"
                                                    value={formatCurrency(editForm.matriculaValue)}
                                                    onChange={e => setEditForm({ ...editForm, matriculaValue: parseCurrency(e.target.value) })}
                                                    onFocus={e => e.target.select()}
                                                />
                                            ) : (
                                                <span className="text-xs font-bold text-[#1e3a5f]">${p.matriculaValue.toLocaleString()}</span>
                                            )}
                                        </div>
                                        <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                                            <span className="text-[9px] font-bold text-emerald-600/70 uppercase block mb-0.5">Total</span>
                                            {isEditing === p.id ? (
                                                <input
                                                    type="text"
                                                    className="w-full bg-transparent text-xs font-bold text-emerald-700 outline-none"
                                                    value={formatCurrency(editForm.totalValue)}
                                                    onChange={e => setEditForm({ ...editForm, totalValue: parseCurrency(e.target.value) })}
                                                    onFocus={e => e.target.select()}
                                                />
                                            ) : (
                                                <span className="text-xs font-bold text-emerald-700">${p.totalValue.toLocaleString()}</span>
                                            )}
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 text-center">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">Módulos</span>
                                            {isEditing === p.id ? (
                                                <div className="flex items-center justify-center gap-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditForm({ ...editForm, modulesCount: Math.max(1, (editForm.modulesCount ?? 1) - 1) })}
                                                        className="p-1 rounded bg-gray-200/80 hover:bg-gray-300 text-gray-600 disabled:opacity-40"
                                                        disabled={(editForm.modulesCount ?? 1) <= 1}
                                                        aria-label="Disminuir"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        className="w-10 bg-transparent text-xs font-bold text-gray-600 outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        value={editForm.modulesCount ?? ""}
                                                        onChange={e => {
                                                            const v = parseInt(e.target.value, 10);
                                                            if (!isNaN(v) && v >= 1) setEditForm({ ...editForm, modulesCount: v });
                                                        }}
                                                        onFocus={e => e.target.select()}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditForm({ ...editForm, modulesCount: (editForm.modulesCount ?? 1) + 1 })}
                                                        className="p-1 rounded bg-gray-200/80 hover:bg-gray-300 text-gray-600"
                                                        aria-label="Aumentar"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-gray-600">{p.modulesCount}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View: Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Nombre del Programa</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Matrícula ($)</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Valor Total ($)</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Módulos</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {programs.map(p => (
                                        <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                {isEditing === p.id ? (
                                                    <input
                                                        className="px-4 py-2 border rounded-xl w-full text-sm font-bold text-[#1e3a5f] outline-none focus:ring-2 focus:ring-primary/20"
                                                        value={editForm.name}
                                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                    />
                                                ) : (
                                                    <span className="font-bold text-[#1e3a5f] group-hover:text-primary transition-colors">{p.name}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {isEditing === p.id ? (
                                                    <input
                                                        type="text"
                                                        className="px-3 py-2 border rounded-xl w-28 text-center text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                                        value={formatCurrency(editForm.matriculaValue)}
                                                        onChange={e => setEditForm({ ...editForm, matriculaValue: parseCurrency(e.target.value) })}
                                                        onFocus={e => e.target.select()}
                                                    />
                                                ) : (
                                                    <span className="text-gray-600 font-medium">${p.matriculaValue.toLocaleString()}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {isEditing === p.id ? (
                                                    <input
                                                        type="text"
                                                        className="px-3 py-2 border rounded-xl w-32 text-center text-sm font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-primary/20"
                                                        value={formatCurrency(editForm.totalValue)}
                                                        onChange={e => setEditForm({ ...editForm, totalValue: parseCurrency(e.target.value) })}
                                                        onFocus={e => e.target.select()}
                                                    />
                                                ) : (
                                                    <span className="font-black text-emerald-600">${p.totalValue.toLocaleString()}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {isEditing === p.id ? (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditForm({ ...editForm, modulesCount: Math.max(1, (editForm.modulesCount ?? 1) - 1) })}
                                                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#1e3a5f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                            disabled={(editForm.modulesCount ?? 1) <= 1}
                                                            aria-label="Disminuir módulos"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            className="w-14 px-2 py-2 border rounded-xl text-center text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            value={editForm.modulesCount ?? ""}
                                                            onChange={e => {
                                                                const v = parseInt(e.target.value, 10);
                                                                if (!isNaN(v) && v >= 1) setEditForm({ ...editForm, modulesCount: v });
                                                            }}
                                                            onFocus={e => e.target.select()}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditForm({ ...editForm, modulesCount: (editForm.modulesCount ?? 1) + 1 })}
                                                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#1e3a5f] transition-colors"
                                                            aria-label="Aumentar módulos"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 font-black">{p.modulesCount}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    {isEditing === p.id ? (
                                                        <>
                                                            <button onClick={handleSave} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                                                                <Check size={18} />
                                                            </button>
                                                            <button onClick={() => setIsEditing(null)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                                                <X size={18} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => handleEditClick(p)} className="p-2 text-primary hover:bg-blue-50 rounded-xl transition-all">
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(p.id)}
                                                                className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

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
