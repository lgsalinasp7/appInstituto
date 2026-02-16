"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import Image from "next/image";
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
import { toast } from "sonner";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma la nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const branding = useBranding();
  const isDark = branding.darkMode !== false;

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function handleSubmit(data: ChangePasswordFormData) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        toast.error(result.error || "Error al cambiar contraseña");
        return;
      }

      toast.success("Contraseña actualizada correctamente");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Error al cambiar contraseña");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "relative p-8 rounded-[2rem] border transition-all duration-300 shadow-2xl overflow-hidden",
          isDark
            ? "bg-slate-900/50 backdrop-blur-xl border-slate-800 hover:border-cyan-500/30 shadow-cyan-900/10"
            : "bg-white border-gray-100/80 hover:border-blue-500/20 shadow-blue-900/5"
        )}
      >
        <div
          className={cn(
            "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] pointer-events-none transition-opacity duration-500",
            isDark ? "bg-cyan-500/10 opacity-100" : "bg-blue-500/5 opacity-50"
          )}
        />

        <div className="pt-2 pb-6 px-2 text-center relative z-10 flex flex-col items-center">
          {branding.logoUrl && (
            <div className="relative w-16 h-16 mb-4">
              <Image
                src={branding.logoUrl}
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            <Shield className={cn("w-5 h-5", isDark ? "text-cyan-400" : "text-blue-500")} />
            <h1 className="text-xl font-bold">Cambiar contraseña</h1>
          </div>
          <p className="text-sm mb-6 max-w-sm">
            Por seguridad, debes cambiar tu contraseña antes de continuar usando la aplicación.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña actual</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        type={showCurrent ? "text" : "password"}
                        placeholder="••••••••"
                        className={cn(
                          "pl-10 pr-10",
                          isDark
                            ? "bg-slate-800 border-slate-700 text-white"
                            : "bg-gray-50 border-gray-200"
                        )}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                      >
                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        type={showNew ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        className={cn(
                          "pl-10 pr-10",
                          isDark
                            ? "bg-slate-800 border-slate-700 text-white"
                            : "bg-gray-50 border-gray-200"
                        )}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                      >
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
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
                  <FormLabel>Confirmar nueva contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        type="password"
                        placeholder="Repite la nueva contraseña"
                        className={cn(
                          "pl-10",
                          isDark
                            ? "bg-slate-800 border-slate-700 text-white"
                            : "bg-gray-50 border-gray-200"
                        )}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-12 font-bold",
                isDark
                  ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              )}
            >
              {isLoading ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
