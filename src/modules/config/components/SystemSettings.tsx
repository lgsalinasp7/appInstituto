"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Target, Bell } from "lucide-react";
import { toast } from "sonner";

export function SystemSettings() {
    const [monthlyGoal, setMonthlyGoal] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            // Endpoint que deberíamos crear o usar uno existente
            const res = await fetch("/api/config/MONTHLY_GOAL");
            const data = await res.json();
            if (data.success) {
                setMonthlyGoal(Number(data.data.value));
            }
        } catch (error) {
            console.error("Error loading settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "MONTHLY_GOAL", value: String(monthlyGoal) })
            });
            if (res.ok) {
                toast.success("Configuración guardada exitosamente");
            } else {
                throw new Error("Error al guardar");
            }
        } catch {
            toast.error("Error al guardar la configuración");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Cargando configuración...</div>;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Target size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#1e3a5f]">Metas Financieras</h3>
                        <p className="text-xs text-gray-500">Define los objetivos mensuales de recaudo</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Meta de Recaudo Mensual ($)</label>
                        <input
                            type="number"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-black text-lg text-[#1e3a5f]"
                            value={monthlyGoal}
                            onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                        />
                        <p className="mt-2 text-xs text-gray-400 italic font-medium leading-relaxed">
                            Este valor se utilizará en el Dashboard para calcular el progreso porcentual y las métricas de eficiencia.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Bell size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#1e3a5f]">Notificaciones</h3>
                        <p className="text-xs text-gray-500">Configuración de recordatorios de pago</p>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <div>
                        <p className="text-sm font-bold text-[#1e3a5f]">Días de anticipación</p>
                        <p className="text-xs text-gray-500">Enviar recordatorio 3 días antes del vencimiento</p>
                    </div>
                    <div className="bg-white px-2 py-1 rounded text-[10px] font-black text-[#1e3a5f] border border-gray-100 uppercase tracking-tighter">Próximamente</div>
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-[#1e3a5f] text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/10"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Guardar Configuración
                </button>
            </div>
        </div>
    );
}
