"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Check, X, BookOpen } from "lucide-react";
import { toast } from "sonner";
import type { Program } from "@/modules/programs/types";

export function ProgramManager() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Program>>({});

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-primary flex items-center gap-2">
                    <BookOpen size={20} />
                    Gestión de Programas Académicos
                </h3>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90">
                    <Plus size={16} /> Nuevo Programa
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading && (
                    <div className="p-8 text-center text-gray-400">Cargando programas...</div>
                )}
                {!loading && <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Nombre</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Matrícula ($)</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Total ($)</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Módulos</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {programs.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    {isEditing === p.id ? (
                                        <input
                                            className="px-2 py-1 border rounded w-full"
                                            value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                    ) : (
                                        <span className="font-bold text-primary">{p.name}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {isEditing === p.id ? (
                                        <input
                                            type="number"
                                            className="px-2 py-1 border rounded w-24 text-center"
                                            value={editForm.matriculaValue}
                                            onChange={e => setEditForm({ ...editForm, matriculaValue: Number(e.target.value) })}
                                        />
                                    ) : (
                                        <span className="text-gray-600">${p.matriculaValue.toLocaleString()}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-emerald-600">
                                    {isEditing === p.id ? (
                                        <input
                                            type="number"
                                            className="px-2 py-1 border rounded w-32 text-center"
                                            value={editForm.totalValue}
                                            onChange={e => setEditForm({ ...editForm, totalValue: Number(e.target.value) })}
                                        />
                                    ) : (
                                        <span>${p.totalValue.toLocaleString()}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {isEditing === p.id ? (
                                        <input
                                            type="number"
                                            className="px-2 py-1 border rounded w-16 text-center"
                                            value={editForm.modulesCount}
                                            onChange={e => setEditForm({ ...editForm, modulesCount: Number(e.target.value) })}
                                        />
                                    ) : (
                                        <span className="text-gray-500 font-medium">{p.modulesCount}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {isEditing === p.id ? (
                                            <>
                                                <button onClick={handleSave} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                                    <Check size={18} />
                                                </button>
                                                <button onClick={() => setIsEditing(null)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                                                    <X size={18} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEditClick(p)} className="p-1.5 text-primary hover:bg-blue-50 rounded-lg">
                                                    <Edit size={18} />
                                                </button>
                                                <button className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>}
            </div>
        </div>
    );
}
