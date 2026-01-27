"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreVertical, CreditCard, Pencil, Trash2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";
import { StudentForm, StudentDetailModal, DeleteConfirmationModal } from "@/modules/students/components";
import type { StudentWithRelations } from "@/modules/students/types";
import { toast } from "sonner";

export default function MatriculasPage() {
    const [students, setStudents] = useState<StudentWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<StudentWithRelations | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<StudentWithRelations | null>(null);
    const [isDeletingLoading, setIsDeletingLoading] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuthStore();

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const url = searchTerm
                ? `/api/students?search=${encodeURIComponent(searchTerm)}`
                : "/api/students";

            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setStudents(data.data.students);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Error al cargar estudiantes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSuccess = () => {
        fetchStudents();
        setEditingStudent(null);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingStudent) return;

        setIsDeletingLoading(true);
        try {
            const response = await fetch(`/api/students/${deletingStudent.id}`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (data.success) {
                toast.success("Estudiante eliminado correctamente");
                fetchStudents();
                setDeletingStudent(null);
            } else {
                throw new Error(data.error || "Error al eliminar");
            }
        } catch (error) {
            console.error("Error deleting student:", error);
            toast.error(error instanceof Error ? error.message : "Error al eliminar el estudiante");
        } finally {
            setIsDeletingLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <DashboardHeader
                title="Gestión de Matrículas"
                subtitle="Administra los estudiantes inscritos y sus estados"
            >
                <button
                    onClick={() => {
                        setEditingStudent(null);
                        setIsFormOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-instituto text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#1e3a5f]/20 transition-all active:scale-95"
                >
                    <Plus size={20} strokeWidth={2.5} />
                    Nueva Matrícula
                </button>
            </DashboardHeader>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Barra de herramientas */}
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, documento o teléfono..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#f8fafc]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#64748b] uppercase tracking-wider">Estudiante</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#64748b] uppercase tracking-wider">Programa</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#64748b] uppercase tracking-wider">Matrícula</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#64748b] uppercase tracking-wider">Módulo Actual</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#64748b] uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-[#64748b] uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Cargando estudiantes...</td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No se encontraron estudiantes</td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] flex items-center justify-center font-bold text-sm">
                                                    {student.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#1e3a5f]">{student.fullName}</p>
                                                    <p className="text-xs text-[#64748b]">{student.documentType} {student.documentNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-[#475569]">{student.program.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {student.matriculaPaid ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    Pagada
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                    Pendiente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="text-sm font-bold text-[#1e3a5f]">
                                                    {student.currentModule} <span className="text-gray-400 font-normal">/ 6</span>
                                                </span>
                                                <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#1e3a5f]"
                                                        style={{ width: `${(student.currentModule / 6) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${student.status === "MATRICULADO"
                                                ? "bg-blue-50 text-blue-700"
                                                : student.status === "PENDIENTE"
                                                    ? "bg-yellow-50 text-yellow-700"
                                                    : "bg-red-50 text-red-700"
                                                }`}>
                                                {student.status.toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => setSelectedStudentId(student.id)}
                                                    className="p-2 text-gray-400 hover:text-[#1e3a5f] hover:bg-[#1e3a5f]/5 rounded-lg transition-colors"
                                                    title="Ver detalle y pagos"
                                                >
                                                    <CreditCard size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingStudent(student);
                                                        setIsFormOpen(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar matrícula"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingStudent(student)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar matrícula"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-[#64748b]">
                    <span>Mostrando {students.length} estudiantes</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Anterior</button>
                        <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Siguiente</button>
                    </div>
                </div>
            </div>

            <StudentForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingStudent(null);
                }}
                onSuccess={handleSuccess}
                currentUserId={user?.id || ""}
                student={editingStudent}
            />

            {selectedStudentId && (
                <StudentDetailModal
                    studentId={selectedStudentId}
                    isOpen={!!selectedStudentId}
                    onClose={() => setSelectedStudentId(null)}
                    onPaymentClick={() => {
                        console.log("Ir a pagar para", selectedStudentId);
                        setSelectedStudentId(null);
                    }}
                />
            )}

            <DeleteConfirmationModal
                isOpen={!!deletingStudent}
                onClose={() => setDeletingStudent(null)}
                onConfirm={handleDeleteConfirm}
                studentName={deletingStudent?.fullName || ""}
                isLoading={isDeletingLoading}
            />
        </div>
    );
}
