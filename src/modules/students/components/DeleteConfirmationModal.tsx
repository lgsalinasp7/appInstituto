"use client";

import { X, AlertTriangle, Trash2 } from "lucide-react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    studentName: string;
    isLoading?: boolean;
}

import { useBranding } from "@/components/providers/BrandingContext";
import { cn } from "@/lib/utils";

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    studentName,
    isLoading = false,
}: DeleteConfirmationModalProps) {
    const branding = useBranding();
    const isDark = branding.darkMode !== false;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-3 sm:p-4 animate-fade-in">
            <div className={cn(
                "rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border animate-scale-in transition-colors",
                isDark ? "bg-slate-900 border-white/10" : "bg-white border-gray-100"
            )}>
                <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors",
                            isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-500"
                        )}>
                            <AlertTriangle size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <button
                            onClick={onClose}
                            className={cn(
                                "transition-colors",
                                isDark ? "text-slate-500 hover:text-slate-300" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <X size={20} className="sm:w-6 sm:h-6" />
                        </button>
                    </div>

                    <h3 className={cn(
                        "text-lg sm:text-xl font-bold mb-2",
                        isDark ? "text-slate-200" : "text-primary"
                    )}>
                        Confirmar Eliminación
                    </h3>
                    <p className={cn(
                        "mb-4 sm:mb-6 text-sm sm:text-base",
                        isDark ? "text-slate-400" : "text-gray-500"
                    )}>
                        ¿Estás seguro de que deseas eliminar la matrícula de{" "}
                        <span className={cn("font-bold", isDark ? "text-slate-200" : "text-primary")}>{studentName}</span>?
                        Esta acción no se puede deshacer y se perderán todos los registros de
                        pagos y compromisos asociados.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                            onClick={onClose}
                            className={cn(
                                "w-full sm:flex-1 py-2.5 sm:py-3 px-4 font-bold rounded-xl sm:rounded-2xl transition-all border-2 text-sm sm:text-base order-2 sm:order-1",
                                isDark
                                    ? "bg-transparent text-slate-400 border-slate-700 hover:bg-slate-800"
                                    : "bg-transparent text-gray-500 border-gray-100 hover:bg-gray-100"
                            )}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={cn(
                                "w-full sm:flex-1 py-2.5 sm:py-3 px-4 font-bold rounded-xl sm:rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base order-1 sm:order-2",
                                isDark
                                    ? "bg-red-500 hover:bg-red-600 text-white shadow-red-900/20"
                                    : "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                            )}
                        >
                            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                            {isLoading ? "Eliminando..." : "Eliminar"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
