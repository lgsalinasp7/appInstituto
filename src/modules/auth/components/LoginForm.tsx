import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff, Lock, ArrowRight, User, Mail } from "lucide-react";
import { useBranding } from "@/components/providers/BrandingContext";
import { cn } from "@/lib/utils";

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

import { loginSchema, type LoginFormData } from "../schemas";

interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => Promise<void>;
  /** Variante split: formulario en tarjeta oscura estilo diseño nuevo */
  variant?: "default" | "split";
}

export function LoginForm({ onSubmit, variant = "default" }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const branding = useBranding();
  const isEdutec = branding.tenantSlug === "edutec";
  const isDark = branding.darkMode !== false;
  const useSplitStyle = variant === "split" || (isDark && variant === "default");
  const useEdutecStyle = isEdutec;

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleSubmit(data: LoginFormData) {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onSubmit?.(data);
    } finally {
      setIsLoading(false);
    }
  }

  const EmailIcon = useEdutecStyle ? Mail : User;
  const emailPlaceholder = useEdutecStyle ? "¿Cuál es tu correo electrónico?" : "correo@empresa.com";

  return (
    <div className="relative w-full">
      <div className={cn(
        "relative p-8 lg:p-10 rounded-2xl transition-all duration-300 overflow-hidden",
        useEdutecStyle
          ? "bg-white border border-slate-200/80 shadow-[0_8px_30px_rgba(30,58,95,0.08)]"
          : cn(
            "rounded-[2rem] border shadow-2xl",
            useSplitStyle
              ? "bg-slate-900/45 backdrop-blur-xl border-white/10 shadow-cyan-900/10"
              : isDark
                ? "bg-slate-900/50 backdrop-blur-xl border-slate-800 hover:border-cyan-500/30 shadow-cyan-900/10"
                : "bg-white border-gray-100/80 hover:border-blue-500/20 shadow-blue-900/5"
          )
      )}>
        {!useEdutecStyle && (
          <div className={cn(
            "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] pointer-events-none transition-opacity duration-500",
            useSplitStyle ? "bg-cyan-500/20 opacity-100" : isDark ? "bg-cyan-500/10 opacity-100" : "bg-blue-500/5 opacity-50"
          )} />
        )}

        <div className={cn(
          "pt-2 pb-8 px-2 text-center relative z-10 flex flex-col items-center",
          useEdutecStyle && "pb-6"
        )}>
          <h1 className={cn(
            "text-2xl md:text-3xl font-bold mb-1.5 tracking-tight",
            useEdutecStyle ? "text-slate-900" : useSplitStyle || isDark ? "text-white font-black tracking-tighter" : "text-slate-900 font-black tracking-tighter"
          )}>
            {useEdutecStyle && <span className="mr-1.5">👋</span>}
            {useEdutecStyle ? "¡Bienvenido de nuevo!" : "¡Bienvenido de nuevo!"}
          </h1>
          {!useEdutecStyle && (
            <p className={cn(
              "text-sm font-semibold",
              useSplitStyle || isDark ? "text-slate-400" : "text-slate-500"
            )}>
              Accede al portal de {branding.tenantName || "Plataforma Educativa"}
            </p>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="relative z-10">
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    {!useEdutecStyle && (
                      <FormLabel className={cn(
                        "font-bold text-[10px] uppercase tracking-widest ml-1 transition-colors",
                        isDark ? "text-slate-500" : "text-slate-400"
                      )}>
                        Correo electrónico
                      </FormLabel>
                    )}
                    <FormControl>
                      <div className="relative group">
                        <EmailIcon className={cn(
                          "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300",
                          useEdutecStyle
                            ? "text-slate-400 group-focus-within:text-[#1e3a5f]"
                            : isDark ? "text-slate-600 group-focus-within:text-cyan-400" : "text-slate-400 group-focus-within:text-blue-500"
                        )} />
                        <Input
                          type="email"
                          placeholder={emailPlaceholder}
                          className={cn(
                            "pl-12 rounded-xl transition-all duration-300 text-sm",
                            useEdutecStyle
                              ? "h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:ring-[#1e3a5f]/10"
                              : cn(
                                "h-13 font-bold",
                                useSplitStyle || isDark
                                  ? "bg-slate-950/60 border-slate-700/50 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/10"
                                  : "bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-blue-500/5"
                              )
                          )}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="font-bold text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between ml-1">
                      {!useEdutecStyle && (
                        <FormLabel className={cn(
                          "font-bold text-[10px] uppercase tracking-widest transition-colors",
                          isDark ? "text-slate-500" : "text-slate-400"
                        )}>
                          Contraseña
                        </FormLabel>
                      )}
                      <Link
                        href="/auth/forgot-password"
                        className={cn(
                          "transition-colors",
                          useEdutecStyle
                            ? "text-sm text-blue-500 hover:text-blue-600 font-medium ml-auto"
                            : "text-[10px] font-black uppercase tracking-widest"
                        )}
                      >
                        {useEdutecStyle ? "¿Olvidaste tu contraseña?" : "¿Olvidaste tu contraseña?"}
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative group">
                        <Lock className={cn(
                          "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300",
                          useEdutecStyle
                            ? "text-slate-400 group-focus-within:text-[#1e3a5f]"
                            : isDark ? "text-slate-600 group-focus-within:text-cyan-400" : "text-slate-400 group-focus-within:text-blue-500"
                        )} />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={useEdutecStyle ? "Ingresa tu contraseña" : "••••••••"}
                          className={cn(
                            "pl-12 pr-12 rounded-xl transition-all duration-300 text-sm",
                            useEdutecStyle
                              ? "h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:ring-[#1e3a5f]/10"
                              : cn(
                                "h-13 font-bold",
                                isDark
                                  ? "bg-slate-950/50 border-slate-700/50 text-white placeholder:text-slate-700 focus:border-cyan-500/50 focus:ring-cyan-500/10"
                                  : "bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-blue-500/5"
                              )
                          )}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={cn(
                            "absolute right-4 top-1/2 -translate-y-1/2 transition-colors",
                            useEdutecStyle
                              ? "text-slate-400 hover:text-slate-600"
                              : useSplitStyle || isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-600"
                          )}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="font-bold text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className={cn(
                  "w-full mt-6 font-semibold rounded-xl transition-all duration-300 group",
                  useEdutecStyle
                    ? "h-12 bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-md hover:shadow-lg active:scale-[0.99]"
                    : cn(
                      "h-13 font-black rounded-2xl shadow-xl uppercase tracking-widest text-xs",
                      useSplitStyle || isDark
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-[1.02] text-white shadow-cyan-900/20 active:scale-[0.98]"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-[1.02] shadow-blue-900/10 active:scale-[0.98]"
                    )
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verificando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {useEdutecStyle ? "Continuar" : "Ingresar al Portal"}
                    {!useEdutecStyle && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
