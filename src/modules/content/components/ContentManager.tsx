"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, GripVertical, Save, X, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Program {
    id: string;
    name: string;
}

interface AcademicContent {
    id: string;
    name: string;
    description: string | null;
    orderIndex: number;
    programId: string;
}

export function ContentManager() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [selectedProgramId, setSelectedProgramId] = useState<string>("");
    const [contents, setContents] = useState<AcademicContent[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        orderIndex: 0,
    });

    useEffect(() => {
        fetchPrograms();
    }, []);

    useEffect(() => {
        if (selectedProgramId) {
            fetchContents();
        } else {
            setContents([]);
        }
    }, [selectedProgramId]);

    const fetchPrograms = async () => {
        try {
            const res = await fetch("/api/programs");
            const data = await res.json();
            if (data.success) {
                setPrograms(data.data.programs || data.data);
                if (data.data.length > 0) setSelectedProgramId(data.data[0].id);
            }
        } catch (error) {
            toast.error("Error al cargar programas");
        }
    };

    const fetchContents = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/content?programId=${selectedProgramId}`);
            const data = await res.json();
            if (data.success) {
                setContents(data.data);
            }
        } catch (error) {
            toast.error("Error al cargar contenidos");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name) return toast.error("El nombre es requerido");

        try {
            const url = editingId ? `/api/content/${editingId}` : "/api/content";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    programId: selectedProgramId,
                    orderIndex: editingId
                        ? formData.orderIndex
                        : contents.length > 0 ? Math.max(...contents.map(c => c.orderIndex)) + 1 : 1
                }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success(editingId ? "Contenido actualizado" : "Contenido creado");
                setEditingId(null);
                setIsAdding(false);
                setFormData({ name: "", description: "", orderIndex: 0 });
                fetchContents();
            } else {
                toast.error(data.error || "Error al guardar");
            }
        } catch (error) {
            toast.error("Error de conexión");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Está seguro de eliminar este contenido?")) return;

        try {
            const res = await fetch(`/api/content/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("Contenido eliminado");
                fetchContents();
            }
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    const startEdit = (content: AcademicContent) => {
        setEditingId(content.id);
        setFormData({
            name: content.name,
            description: content.description || "",
            orderIndex: content.orderIndex,
        });
        setIsAdding(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                        <BookOpen className="text-blue-500" size={24} />
                        Gestión de Contenido Académico
                    </h2>
                    <p className="text-sm text-gray-500">Administra los módulos y entregas por programa</p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-sm"
                        value={selectedProgramId}
                        onChange={(e) => setSelectedProgramId(e.target.value)}
                    >
                        {programs.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    <Button
                        onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: "", description: "", orderIndex: 0 }); }}
                        className="bg-primary hover:bg-primary-dark text-white rounded-xl gap-2 h-10 px-4"
                    >
                        <Plus size={18} />
                        Nuevo Módulo
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List of contents */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400">Cargando contenidos...</div>
                    ) : contents.length === 0 ? (
                        <div className="p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                            No hay contenidos registrados para este programa
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {contents.map((content) => (
                                <div
                                    key={content.id}
                                    className="group bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            {content.orderIndex}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">{content.name}</h4>
                                            {content.description && (
                                                <p className="text-xs text-gray-500 line-clamp-1">{content.description}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(content)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(content.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Form area */}
                <div className="lg:col-span-1">
                    {(isAdding || editingId) ? (
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg space-y-4 sticky top-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-primary">
                                    {editingId ? "Editar Módulo" : "Nuevo Módulo"}
                                </h3>
                                <button
                                    onClick={() => { setIsAdding(false); setEditingId(null); }}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Nombre</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: Módulo 1: Fundamentos"
                                        className="mt-1 bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Descripción</label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Detalles del contenido..."
                                        className="mt-1 bg-gray-50"
                                        rows={4}
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={handleSave}
                                        className="flex-1 bg-primary text-white rounded-xl gap-2 font-bold"
                                    >
                                        <Save size={18} />
                                        Guardar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => { setIsAdding(false); setEditingId(null); }}
                                        className="rounded-xl"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-blue-900">Agregar Módulo</h4>
                                <p className="text-xs text-blue-700 mt-1">Crea un nuevo paso educativo para los estudiantes de este programa.</p>
                            </div>
                            <Button
                                onClick={() => setIsAdding(true)}
                                variant="outline"
                                className="w-full bg-white border-blue-200 text-blue-600 hover:bg-blue-100 rounded-xl font-bold"
                            >
                                Comenzar
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
