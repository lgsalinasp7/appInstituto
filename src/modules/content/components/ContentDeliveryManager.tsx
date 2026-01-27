"use client";

import { useState, useEffect } from "react";
import { Package, Search, Gift, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface PendingDelivery {
    studentId: string;
    studentName: string;
    programName: string;
    pendingContents: {
        id: string;
        name: string;
        orderIndex: number;
    }[];
}

export function ContentDeliveryManager() {
    const [pending, setPending] = useState<PendingDelivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deliveringId, setDeliveringId] = useState<string | null>(null);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/content/pending");
            const data = await res.json();
            if (data.success) {
                setPending(data.data);
            }
        } catch (error) {
            toast.error("Error al cargar entregas pendientes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleDeliver = async (studentId: string, contentId: string) => {
        setDeliveringId(`${studentId}-${contentId}`);
        try {
            const res = await fetch("/api/content/deliver", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId,
                    contentId,
                    method: "FISICO", // Default for now
                }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Entrega registrada exitosamente");
                fetchPending();
            } else {
                toast.error(data.error || "Error al registrar entrega");
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setDeliveringId(null);
        }
    };

    const filtered = pending.filter(p =>
        p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.programName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                        <Package className="text-emerald-500" size={24} />
                        Entregas de Material Académico
                    </h2>
                    <p className="text-sm text-gray-500">Estudiantes con pagos al día pendientes de recibir contenido</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                        placeholder="Buscar estudiante..."
                        className="pl-9 h-10 bg-gray-50 border-gray-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Estudiante</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Programa</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Contenido Pendiente</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">Cargando pendientes...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                        {searchTerm ? "No se encontraron resultados" : "Todos los estudiantes están al día con sus entregas"}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item) => (
                                    <tr key={item.studentId} className="hover:bg-emerald-50/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{item.studentName}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none">
                                                {item.programName}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {item.pendingContents.map((c) => (
                                                    <div key={c.id} className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium border border-amber-100">
                                                        <Clock size={12} />
                                                        {c.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right space-y-2">
                                            {item.pendingContents.map((c) => (
                                                <Button
                                                    key={c.id}
                                                    size="sm"
                                                    onClick={() => handleDeliver(item.studentId, c.id)}
                                                    disabled={deliveringId === `${item.studentId}-${c.id}`}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg gap-2 font-bold w-full md:w-auto ml-2 mb-1"
                                                >
                                                    {deliveringId === `${item.studentId}-${c.id}` ? (
                                                        "Registrando..."
                                                    ) : (
                                                        <>
                                                            <Gift size={14} />
                                                            Entregar {c.orderIndex}
                                                        </>
                                                    )}
                                                </Button>
                                            ))}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-amber-800 space-y-1">
                    <p className="font-bold uppercase tracking-wider">Lógica de Disponibilidad</p>
                    <p>Un contenido se marca como "disponible para entrega" automáticamente cuando el estudiante registra su pago correspondiente (ej. Pago 1 libera Módulo 1). El sistema valida el historial de pagos contra el orden de los módulos.</p>
                </div>
            </div>
        </div>
    );
}
