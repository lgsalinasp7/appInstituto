"use client";

/**
 * Register Form Component
 * Formulario de registro con diseño glassmorphism premium
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { registerSchema, type RegisterFormData } from "../schemas";

interface RegisterFormProps {
  onSubmit?: (data: RegisterFormData) => Promise<void>;
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function handleSubmit(data: RegisterFormData) {
    setIsLoading(true);
    try {
      await onSubmit?.(data);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative">
      {/* Card con glassmorphism */}
      <div className="relative backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl shadow-black/20 border border-white/20 overflow-hidden">
        {/* Gradiente decorativo en la parte superior */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1e3a5f] via-[#3b82f6] to-[#1e3a5f]" />
        
        {/* Header del card */}
        <div className="pt-8 pb-4 px-8 text-center relative">
          {/* Logo pequeño centrado */}
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16 opacity-90">
              <Image
                src="/logo-instituto.png"
                alt="Educamos con Valores"
                fill
                className="object-contain drop-shadow-lg"
              />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2">
            Crear tu cuenta
          </h1>
          <p className="text-sm text-[#64748b]">
            Únete a nuestra comunidad educativa
          </p>
        </div>

        {/* Formulario */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="px-8 pb-6 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1e3a5f] font-semibold text-sm">
                      Nombre completo
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8] group-focus-within:text-[#1e3a5f] transition-colors" />
                        <Input
                          placeholder="Tu nombre"
                          className="pl-12 h-11 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-xl focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 transition-all placeholder:text-[#94a3b8]"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1e3a5f] font-semibold text-sm">
                      Correo electrónico
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8] group-focus-within:text-[#1e3a5f] transition-colors" />
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          className="pl-12 h-11 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-xl focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 transition-all placeholder:text-[#94a3b8]"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#1e3a5f] font-semibold text-sm">
                        Contraseña
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8] group-focus-within:text-[#1e3a5f] transition-colors" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-12 pr-10 h-11 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-xl focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 transition-all placeholder:text-[#94a3b8]"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#1e3a5f] transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#1e3a5f] font-semibold text-sm">
                        Confirmar
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8] group-focus-within:text-[#1e3a5f] transition-colors" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-12 pr-10 h-11 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-xl focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 transition-all placeholder:text-[#94a3b8]"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#1e3a5f] transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Beneficios */}
              <div className="bg-[#f8fafc] rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-[#1e3a5f] mb-2">Al registrarte obtienes:</p>
                <div className="flex items-center gap-2 text-xs text-[#64748b]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Acceso a todos los programas educativos</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#64748b]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Seguimiento personalizado de tu progreso</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#64748b]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Soporte directo con asesores</span>
                </div>
              </div>

              {/* Botón de submit */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] hover:from-[#2d4a6f] hover:to-[#1e3a5f] text-white font-semibold rounded-xl shadow-lg shadow-[#1e3a5f]/25 hover:shadow-xl hover:shadow-[#1e3a5f]/30 transition-all duration-300 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Creando cuenta...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Crear Cuenta
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* Divider */}
        <div className="px-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e2e8f0]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-[#94a3b8] font-medium">
                ¿Ya tienes una cuenta?
              </span>
            </div>
          </div>
        </div>

        {/* Link a login */}
        <div className="p-6 pt-4 text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-[#1e3a5f] font-semibold hover:text-[#3b82f6] transition-colors group"
          >
            Iniciar sesión
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Efecto de sombra suave */}
      <div className="absolute -inset-4 bg-gradient-to-r from-[#1e3a5f]/10 via-[#3b82f6]/10 to-[#1e3a5f]/10 rounded-[32px] blur-2xl -z-10 opacity-60" />
    </div>
  );
}
