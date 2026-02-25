"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, User, Phone, Mail, MapPin, GraduationCap, Calendar, DollarSign, UserCheck, CreditCard } from "lucide-react";
import { createStudentSchema, PAYMENT_METHODS, type CreateStudentInput } from "../schemas";
import type { StudentWithRelations, CreateStudentResult } from "../types";
import { formatCurrency, parseCurrency } from "@/lib/utils";

// Helper para formatear fecha a YYYY-MM-DD
const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

interface Program {
  id: string;
  name: string;
  totalValue: number;
  matriculaValue: number;
  modulesCount: number;
}

interface Advisor {
  id: string;
  name: string | null;
  email: string;
}

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSuccessWithData?: (data: CreateStudentResult) => void;
  currentUserId: string;
  student?: StudentWithRelations | null;
}

export function StudentForm({ isOpen, onClose, onSuccess, onSuccessWithData, currentUserId, student }: StudentFormProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!student;

  const today = new Date();
  const defaultFirstCommitment = new Date(today);
  defaultFirstCommitment.setDate(defaultFirstCommitment.getDate() + 30);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema) as never,
    defaultValues: {
      documentType: "CC",
      status: "MATRICULADO",
      enrollmentDate: formatDateForInput(today) as unknown as Date,
      advisorId: currentUserId,
      initialPayment: 0,
      totalProgramValue: 0,
      paymentFrequency: "MENSUAL",
      firstCommitmentDate: formatDateForInput(defaultFirstCommitment) as unknown as Date,
      paymentMethod: "EFECTIVO" as any,
      paymentReference: "",
    },
  });

  const selectedProgramId = watch("programId");

  // Automatizar valores financieros al cambiar el programa
  useEffect(() => {
    if (selectedProgramId && programs.length > 0 && !isEditing) {
      const program = programs.find(p => p.id === selectedProgramId);
      if (program) {
        setValue("totalProgramValue", Number(program.totalValue));
        setValue("initialPayment", Number(program.matriculaValue));
      }
    }
  }, [selectedProgramId, programs, setValue, isEditing]);

  // Efecto para Resetear el formulario cuando cambia el estudiante o se abre/cierra
  useEffect(() => {
    if (isOpen) {
      if (student) {
        // Modo Edición: Cargar datos
        reset({
          fullName: student.fullName,
          documentType: student.documentType,
          documentNumber: student.documentNumber,
          email: student.email || "",
          phone: student.phone,
          city: student.city || "",
          address: student.address || "",
          guardianName: student.guardianName || "",
          guardianPhone: student.guardianPhone || "",
          guardianEmail: student.guardianEmail || "",
          enrollmentDate: formatDateForInput(new Date(student.enrollmentDate)) as unknown as Date,
          initialPayment: student.initialPayment,
          totalProgramValue: student.totalProgramValue,
          status: student.status as any,
          programId: student.programId,
          advisorId: student.advisorId,
          paymentFrequency: student.paymentFrequency as any,
          firstCommitmentDate: formatDateForInput(student.firstCommitmentDate ? new Date(student.firstCommitmentDate) : new Date()) as unknown as Date,
        });
      } else {
        // Modo Creación: Limpiar TODOS los campos explícitamente
        const todayDate = new Date();
        const firstCommitment = new Date(todayDate);
        firstCommitment.setDate(firstCommitment.getDate() + 30);

        reset({
          // Datos personales - limpiar
          fullName: "",
          documentType: "CC",
          documentNumber: "",
          // Datos de contacto - limpiar
          phone: "",
          email: "",
          city: "",
          address: "",
          // Datos del acudiente - limpiar
          guardianName: "",
          guardianPhone: "",
          guardianEmail: "",
          // Información académica - defaults
          programId: "",
          enrollmentDate: formatDateForInput(todayDate) as unknown as Date,
          advisorId: currentUserId,
          status: "MATRICULADO",
          // Información financiera - defaults
          initialPayment: 0,
          totalProgramValue: 0,
          paymentFrequency: "MENSUAL",
          firstCommitmentDate: formatDateForInput(firstCommitment) as unknown as Date,
          // Pago de matrícula - defaults
          paymentMethod: "EFECTIVO" as any,
          paymentReference: "",
        });
      }
    }
  }, [isOpen, student, reset, currentUserId]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch("/api/programs");
        const data = await response.json();
        if (data.success) {
          setPrograms(data.data.programs);
        }
      } catch (err) {
        console.error("Error fetching programs:", err);
      }
    };

    const fetchAdvisors = async () => {
      try {
        const response = await fetch("/api/users?role=advisor");
        const data = await response.json();
        if (data.success) {
          setAdvisors(data.data.users || []);
        }
      } catch (err) {
        console.error("Error fetching advisors:", err);
        setAdvisors([{ id: currentUserId, name: "Usuario Actual", email: "" }]);
      }
    };

    if (isOpen) {
      fetchPrograms();
      fetchAdvisors();
    }
  }, [isOpen, currentUserId]);

  const onSubmit = async (data: CreateStudentInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = isEditing ? `/api/students/${student.id}` : "/api/students";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Error al ${isEditing ? 'actualizar' : 'registrar'} estudiante`);
      }

      reset();
      onSuccess();

      // Si es una nueva matrícula y tenemos callback con datos, llamarlo para mostrar el recibo
      if (!isEditing && onSuccessWithData && result.data) {
        onSuccessWithData(result.data);
      } else {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 animate-fade-in-up overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl my-4 sm:my-8 overflow-hidden border border-gray-200">
        <div className="bg-gradient-instituto p-4 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 sm:right-6 top-4 sm:top-6 text-white/70 hover:text-white transition-colors hover:rotate-90 duration-200"
          >
            <X size={22} className="sm:w-[26px] sm:h-[26px]" strokeWidth={2.5} />
          </button>
          <h2 className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1 pr-8">
            {isEditing ? "Editar Matrícula" : "Registrar Nuevo Estudiante"}
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm">
            {isEditing ? `Actualizando datos de ${student.fullName}` : "Complete todos los campos requeridos"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[65vh] sm:max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <User size={14} className="sm:w-4 sm:h-4" />
              Datos Personales
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Nombre Completo *
                </label>
                <input
                  {...register("fullName")}
                  className="w-full mt-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all text-sm"
                  placeholder="Nombre completo del estudiante"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tipo de Documento
                </label>
                <select
                  {...register("documentType")}
                  className="w-full mt-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm"
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PA">Pasaporte</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Número de Documento *
                </label>
                <input
                  {...register("documentNumber")}
                  disabled={isEditing}
                  className={`w-full mt-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all text-sm ${isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                  placeholder="Número de documento"
                />
                {errors.documentNumber && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.documentNumber.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <Phone size={14} className="sm:w-4 sm:h-4" />
              Datos de Contacto
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Teléfono *
                </label>
                <input
                  {...register("phone")}
                  className="w-full mt-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all text-sm"
                  placeholder="Número de teléfono"
                />
                {errors.phone && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Mail size={10} className="sm:w-3 sm:h-3" />
                  Email
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full mt-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all text-sm"
                  placeholder="correo@ejemplo.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={10} className="sm:w-3 sm:h-3" />
                  Ciudad
                </label>
                <input
                  {...register("city")}
                  className="w-full mt-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all text-sm"
                  placeholder="Ciudad de residencia"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={10} className="sm:w-3 sm:h-3" />
                  Dirección
                </label>
                <input
                  {...register("address")}
                  className="w-full mt-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all text-sm"
                  placeholder="Dirección de residencia"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <UserCheck size={14} className="sm:w-4 sm:h-4" />
              Datos del Acudiente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Nombre del Acudiente
                </label>
                <input
                  {...register("guardianName")}
                  className="w-full mt-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all text-sm"
                  placeholder="Nombre completo"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Teléfono del Acudiente
                </label>
                <input
                  {...register("guardianPhone")}
                  className="w-full mt-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all text-sm"
                  placeholder="Número de teléfono"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Email del Acudiente
                </label>
                <input
                  {...register("guardianEmail")}
                  type="email"
                  className="w-full mt-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all text-sm"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <GraduationCap size={14} className="sm:w-4 sm:h-4" />
              Información Académica
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Programa Académico *
                </label>
                <select
                  {...register("programId")}
                  className="w-full mt-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm"
                >
                  <option value="">Seleccione un programa</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
                {errors.programId && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.programId.message}</p>
                )}
              </div>

              <div>
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Cantidad de Módulos
                </label>
                <div className="w-full mt-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 border-2 border-gray-200 rounded-lg sm:rounded-xl text-primary font-bold text-sm">
                  {selectedProgramId && programs.find(p => p.id === selectedProgramId)
                    ? `${programs.find(p => p.id === selectedProgramId)?.modulesCount} Módulos`
                    : "---"}
                </div>
              </div>

              <div>
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={10} className="sm:w-3 sm:h-3" />
                  Fecha de Matrícula *
                </label>
                <input
                  {...register("enrollmentDate")}
                  type="date"
                  className="w-full mt-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all text-sm"
                />
                {errors.enrollmentDate && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.enrollmentDate.message}</p>
                )}
              </div>

              <div>
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Asesor Responsable *
                </label>
                <select
                  {...register("advisorId")}
                  className="w-full mt-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm"
                >
                  <option value="">Seleccione un asesor</option>
                  {advisors.map((advisor) => (
                    <option key={advisor.id} value={advisor.id}>
                      {advisor.name || advisor.email}
                    </option>
                  ))}
                </select>
                {errors.advisorId && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.advisorId.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={14} className="sm:w-4 sm:h-4" />
              Información Financiera
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Valor Total del Programa *
                </label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                  <input
                    type="text"
                    className="w-full mt-1 pl-7 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-primary transition-all text-sm"
                    placeholder="0"
                    value={formatCurrency(watch("totalProgramValue"))}
                    onChange={(e) => setValue("totalProgramValue", parseCurrency(e.target.value))}
                    onFocus={(e) => e.target.select()}
                  />
                  <input type="hidden" {...register("totalProgramValue")} />
                </div>
                {errors.totalProgramValue && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.totalProgramValue.message}</p>
                )}
              </div>

              <div>
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Pago Inicial de Matrícula *
                </label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                  <input
                    type="text"
                    className="w-full mt-1 pl-7 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-primary transition-all text-sm"
                    placeholder="0"
                    value={formatCurrency(watch("initialPayment"))}
                    onChange={(e) => setValue("initialPayment", parseCurrency(e.target.value))}
                    onFocus={(e) => e.target.select()}
                  />
                  <input type="hidden" {...register("initialPayment")} />
                </div>
                {errors.initialPayment && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.initialPayment.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Frecuencia de Pago *
                </label>
                <select
                  {...register("paymentFrequency")}
                  className="w-full mt-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm"
                >
                  <option value="MENSUAL">Mensual (30 días)</option>
                  <option value="QUINCENAL">Quincenal (15 días)</option>
                </select>
                {errors.paymentFrequency && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.paymentFrequency.message}</p>
                )}
              </div>

              <div>
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={10} className="sm:w-3 sm:h-3" />
                  Fecha Primer Pago (Módulo 1) *
                </label>
                <input
                  {...register("firstCommitmentDate")}
                  type="date"
                  className="w-full mt-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all text-sm"
                />
                <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1">Fecha límite para pagar el primer módulo</p>
                {errors.firstCommitmentDate && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.firstCommitmentDate.message}</p>
                )}
              </div>
            </div>

            {/* Resumen Calculado */}
            {selectedProgramId && programs.find(p => p.id === selectedProgramId) && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-100">
                <h4 className="text-[10px] sm:text-xs font-bold text-primary uppercase mb-2">Resumen de Pagos</h4>
                <div className="flex justify-between text-xs sm:text-sm mb-1">
                  <span className="text-gray-600">Valor total:</span>
                  <span className="font-bold">${Number(programs.find(p => p.id === selectedProgramId)?.totalValue).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm mb-1">
                  <span className="text-gray-600">Matrícula (inicial):</span>
                  <span className="font-bold">${Number(programs.find(p => p.id === selectedProgramId)?.matriculaValue || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm pt-2 border-t border-blue-200">
                  <span className="text-gray-600">Valor por Módulo ({(programs.find(p => p.id === selectedProgramId)?.modulesCount || 6)} cuotas):</span>
                  <span className="font-bold text-blue-700">
                    ${Math.round((Number(programs.find(p => p.id === selectedProgramId)?.totalValue || 0) - Number(programs.find(p => p.id === selectedProgramId)?.matriculaValue || 0)) / (programs.find(p => p.id === selectedProgramId)?.modulesCount || 1)).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Sección de Pago de Matrícula - Solo para nuevas matrículas */}
          {!isEditing && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <CreditCard size={14} className="sm:w-4 sm:h-4" />
                Pago de Matrícula
              </h3>

              <div className="p-3 sm:p-4 bg-emerald-50 rounded-lg sm:rounded-xl border border-emerald-200">
                <p className="text-xs sm:text-sm text-emerald-700 mb-3 sm:mb-4">
                  El estudiante debe pagar la matrícula para completar la inscripción. Este pago se registra automáticamente.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Valor a Pagar
                    </label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">$</span>
                      <input
                        type="text"
                        className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border-2 border-emerald-300 rounded-lg sm:rounded-xl text-emerald-700 font-bold text-base sm:text-lg focus:outline-none focus:border-emerald-500 transition-all"
                        placeholder="0"
                        value={formatCurrency(watch("initialPayment"))}
                        onChange={(e) => setValue("initialPayment", parseCurrency(e.target.value))}
                        onFocus={(e) => e.target.select()}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Método de Pago *
                    </label>
                    <select
                      {...register("paymentMethod")}
                      className="w-full mt-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-emerald-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-sm"
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                    {errors.paymentMethod && (
                      <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.paymentMethod.message}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Referencia / Comprobante (opcional)
                    </label>
                    <input
                      {...register("paymentReference")}
                      className="w-full mt-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all text-sm"
                      placeholder="Ej: Número de transacción Nequi"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 py-3 sm:py-3.5 text-gray-500 font-bold hover:bg-gray-100 rounded-lg sm:rounded-xl transition-all border-2 border-gray-200 text-sm sm:text-base order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:flex-[2] py-3 sm:py-3.5 bg-gradient-instituto hover:opacity-90 text-white font-bold rounded-lg sm:rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 text-sm sm:text-base order-1 sm:order-2"
            >
              {isLoading ? "Procesando..." : (isEditing ? "Guardar Cambios" : "Registrar Matrícula")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
