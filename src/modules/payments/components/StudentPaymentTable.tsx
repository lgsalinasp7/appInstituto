"use client";

import { useState, useEffect } from "react";
import { Search, DollarSign, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { StudentWithRelations } from "@/modules/students/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface StudentPaymentTableProps {
    onSelectStudent: (student: StudentWithRelations) => void;
}

export function StudentPaymentTable({ onSelectStudent }: StudentPaymentTableProps) {
    const [students, setStudents] = useState<StudentWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const url = searchTerm
                ? `/api/students?search=${encodeURIComponent(searchTerm)}`
                : "/api/students?limit=50";

            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                // Filter only students who paid matricula (as requested by user flow)
                // or keep all but highlight status
                // User said: "muestren todos lo estudiantes que pagaron la matricula"
                // So we filter:
                const enrolled = data.data.students.filter((s: StudentWithRelations) => s.matriculaPaid);
                setStudents(enrolled);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Buscar por nombre o documento..."
                        className="pl-10 h-11 bg-gray-50 border-gray-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle size={16} className="text-emerald-500" />
                    <span>Solo estudiantes con matrícula paga</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Estudiante</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Programa</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Progreso</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Saldo Pendiente</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        Cargando estudiantes...
                                    </td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        No se encontraron estudiantes con matrícula paga
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                                    {student.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{student.fullName}</p>
                                                    <p className="text-xs text-gray-500">{student.documentType} {student.documentNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="font-medium">
                                                {student.program.name}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-xs font-bold text-gray-600">
                                                    Módulo {student.currentModule} / 6
                                                </span>
                                                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${(student.currentModule / 6) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-orange-600">
                                                ${Number(student.remainingBalance).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                onClick={() => onSelectStudent(student)}
                                                className="bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white font-bold transition-all shadow-sm hover:shadow-md gap-2"
                                                size="sm"
                                            >
                                                <DollarSign size={16} />
                                                Registrar Pago
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
