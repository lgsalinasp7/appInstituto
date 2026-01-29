"use client";

import { useState, useEffect } from "react";
import { Search, DollarSign, CheckCircle } from "lucide-react";
import type { StudentWithRelations } from "@/modules/students/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Helper function to truncate text to N words
const truncateWords = (text: string, maxWords: number = 3): string => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
};

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
        <div className="space-y-4 sm:space-y-6">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Buscar estudiante..."
                        className="pl-10 h-10 sm:h-11 bg-gray-50 border-gray-200 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle size={16} className="text-emerald-500" />
                    <span>Solo con matrícula paga</span>
                </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Vista móvil: Tarjetas */}
                <div className="md:hidden">
                    {loading ? (
                        <div className="p-6 text-center text-gray-400">Cargando estudiantes...</div>
                    ) : students.length === 0 ? (
                        <div className="p-6 text-center text-gray-400">No se encontraron estudiantes</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {students.map((student) => (
                                <div key={student.id} className="p-4 hover:bg-gray-50/50">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                {student.fullName.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 text-sm truncate">{student.fullName}</p>
                                                <p className="text-xs text-gray-500">{student.documentType} {student.documentNumber}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <Badge variant="outline" className="font-medium text-xs" title={student.program.name}>
                                            {truncateWords(student.program.name, 3)}
                                        </Badge>
                                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                            Mod. {student.currentModule}/6
                                        </span>
                                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                            ${Number(student.remainingBalance).toLocaleString()}
                                        </span>
                                    </div>

                                    <Button
                                        onClick={() => onSelectStudent(student)}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all gap-2 h-10"
                                        size="sm"
                                    >
                                        <DollarSign size={16} />
                                        Registrar Pago
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Vista desktop: Tabla */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estudiante</th>
                                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Programa</th>
                                <th className="px-4 lg:px-6 py-3 lg:py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Progreso</th>
                                <th className="px-4 lg:px-6 py-3 lg:py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo</th>
                                <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acción</th>
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
                                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                                    {student.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{student.fullName}</p>
                                                    <p className="text-xs text-gray-500">{student.documentType} {student.documentNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                                            <Badge variant="outline" className="font-medium text-xs">
                                                {student.program.name}
                                            </Badge>
                                        </td>
                                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-xs font-bold text-gray-600">
                                                    Mod. {student.currentModule}/6
                                                </span>
                                                <div className="w-16 lg:w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${(student.currentModule / 6) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-center">
                                            <span className="font-bold text-orange-600 text-sm">
                                                ${Number(student.remainingBalance).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                                            <Button
                                                onClick={() => onSelectStudent(student)}
                                                className="bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white font-bold transition-all shadow-sm hover:shadow-md gap-2 text-xs lg:text-sm"
                                                size="sm"
                                            >
                                                <DollarSign size={14} className="lg:w-4 lg:h-4" />
                                                <span className="hidden lg:inline">Registrar Pago</span>
                                                <span className="lg:hidden">Pagar</span>
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
