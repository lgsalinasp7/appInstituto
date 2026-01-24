"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, User, Phone, Mail, MapPin, GraduationCap, Calendar, DollarSign, UserCheck } from "lucide-react";
import { createStudentSchema, type CreateStudentInput } from "../schemas";

interface Program {
  id: string;
  name: string;
  totalValue: number;
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
  currentUserId: string;
}

export function StudentForm({ isOpen, onClose, onSuccess, currentUserId }: StudentFormProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      documentType: "CC",
      status: "MATRICULADO",
      enrollmentDate: new Date(),
      advisorId: currentUserId,
      initialPayment: 0,
      totalProgramValue: 0,
    },
  });

  const selectedProgramId = watch("programId");

  useEffect(() => {
    if (isOpen) {
      fetchPrograms();
      fetchAdvisors();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedProgramId && programs.length > 0) {
      const selectedProgram = programs.find((p) => p.id === selectedProgramId);
      if (selectedProgram) {
        setValue("totalProgramValue", selectedProgram.totalValue);
      }
    }
  }, [selectedProgramId, programs, setValue]);

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

  const onSubmit = async (data: CreateStudentInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al registrar estudiante");
      }

      reset();
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden border border-gray-200">
        <div className="bg-gradient-instituto p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-white/70 hover:text-white transition-colors hover:rotate-90 duration-200"
          >
            <X size={26} strokeWidth={2.5} />
          </button>
          <h2 className="text-2xl font-bold mb-1">Registrar Nuevo Estudiante</h2>
          <p className="text-blue-100 text-sm">Complete todos los campos requeridos</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wider flex items-center gap-2">
              <User size={16} />
              Datos Personales
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  Nombre Completo *
                </label>
                <input
                  {...register("fullName")}
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] font-medium transition-all"
                  placeholder="Nombre completo del estudiante"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  Tipo de Documento
                </label>
                <select
                  {...register("documentType")}
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] font-medium"
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PA">Pasaporte</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  Número de Documento *
                </label>
                <input
                  {...register("documentNumber")}
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] font-medium transition-all"
                  placeholder="Número de documento"
                />
                {errors.documentNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.documentNumber.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wider flex items-center gap-2">
              <Phone size={16} />
              Datos de Contacto
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  Teléfono *
                </label>
                <input
                  {...register("phone")}
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] font-medium transition-all"
                  placeholder="Número de teléfono"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1">
                  <Mail size={12} />
                  Email
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] font-medium transition-all"
                  placeholder="correo@ejemplo.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={12} />
                  Dirección
                </label>
                <input
                  {...register("address")}
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] font-medium transition-all"
                  placeholder="Dirección de residencia"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wider flex items-center gap-2">
              <UserCheck size={16} />
              Datos del Acudiente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  Nombre del Acudiente
                </label>
                <input
                  {...register("guardianName")}
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] font-medium transition-all"
                  placeholder="Nombre completo"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  Teléfono del Acudiente
                </label>
                <input
                  {...register("guardianPhone")}
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] font-medium transition-all"
                  placeholder="Número de teléfono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  Email del Acudiente
                </label>
                <input
                  {...register("guardianEmail")}
                  type="email"
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] font-medium transition-all"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wider flex items-center gap-2">
              <GraduationCap size={16} />
              Información Académica
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  Programa Académico *
                </label>
                <select
                  {...register("programId")}
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] font-medium"
                >
                  <option value="">Seleccione un programa</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name} - ${program.totalValue.toLocaleString()}
                    </option>
                  ))}
                </select>
                {errors.programId && (
                  <p className="text-red-500 text-xs mt-1">{errors.programId.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  Estado
                </label>
                <select
                  {...register("status")}
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] font-medium"
                >
                  <option value="MATRICULADO">Matriculado</option>
                  <option value="EN_OTRA_INSTITUCION">En otra institución</option>
                  <option value="PENDIENTE">Pendiente</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={12} />
                  Fecha de Matrícula *
                </label>
                <input
                  {...register("enrollmentDate")}
                  type="date"
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] font-medium transition-all"
                />
                {errors.enrollmentDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.enrollmentDate.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  Asesor Responsable *
                </label>
                <select
                  {...register("advisorId")}
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] font-medium"
                >
                  <option value="">Seleccione un asesor</option>
                  {advisors.map((advisor) => (
                    <option key={advisor.id} value={advisor.id}>
                      {advisor.name || advisor.email}
                    </option>
                  ))}
                </select>
                {errors.advisorId && (
                  <p className="text-red-500 text-xs mt-1">{errors.advisorId.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={16} />
              Información Financiera
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  Valor Total del Programa *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] font-bold">$</span>
                  <input
                    {...register("totalProgramValue")}
                    type="number"
                    className="w-full mt-1 pl-8 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] font-bold text-[#1e3a5f] transition-all"
                    placeholder="0"
                  />
                </div>
                {errors.totalProgramValue && (
                  <p className="text-red-500 text-xs mt-1">{errors.totalProgramValue.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  Pago Inicial de Matrícula *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] font-bold">$</span>
                  <input
                    {...register("initialPayment")}
                    type="number"
                    className="w-full mt-1 pl-8 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] font-bold text-[#1e3a5f] transition-all"
                    placeholder="0"
                  />
                </div>
                {errors.initialPayment && (
                  <p className="text-red-500 text-xs mt-1">{errors.initialPayment.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 text-[#64748b] font-bold hover:bg-gray-100 rounded-xl transition-all border-2 border-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] py-3.5 bg-gradient-instituto hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg shadow-[#1e3a5f]/20 disabled:opacity-50"
            >
              {isLoading ? "Guardando..." : "Registrar Estudiante"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
