"use client";

import { X, AlertTriangle, Trash2 } from "lucide-react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    studentName: string;
    isLoading?: boolean;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    studentName,
    isLoading = false,
}: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-3 sm:p-4 animate-fade-in">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-scale-in">
                <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                            <AlertTriangle size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} className="sm:w-6 sm:h-6" />
                        </button>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">
                        Confirmar Eliminación
                    </h3>
                    <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                        ¿Estás seguro de que deseas eliminar la matrícula de{" "}
                        <span className="font-bold text-primary">{studentName}</span>?
                        Esta acción no se puede deshacer y se perderán todos los registros de
                        pagos y compromisos asociados.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                            onClick={onClose}
                            className="w-full sm:flex-1 py-2.5 sm:py-3 px-4 text-gray-500 font-bold hover:bg-gray-100 rounded-xl sm:rounded-2xl transition-all border-2 border-gray-100 text-sm sm:text-base order-2 sm:order-1"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="w-full sm:flex-1 py-2.5 sm:py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base order-1 sm:order-2"
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
