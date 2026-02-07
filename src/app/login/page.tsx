"use client";

/**
 * Login Page para admin.kaledsoft.tech
 * Redirige a /admin después de login exitoso
 * Solo visible cuando el contexto es "admin"
 */

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoginForm, type LoginFormData } from "@/modules/auth";
import { loginAction } from "@/modules/auth/actions";
import { useAuthStore } from "@/lib/store/auth-store";
import { Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  async function handleLogin(data: LoginFormData) {
    const result = await loginAction(data);

    if (result.success && result.user) {
      login(result.user);
      toast.success(`Bienvenido, ${result.user.name}`);
      router.push("/admin");
    } else {
      toast.error(result.message || "Error al iniciar sesion");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-4 backdrop-blur-sm border border-blue-400/20">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">KaledSoft Admin</h1>
          <p className="text-sm text-blue-300/70 mt-1">Panel de administracion de plataforma</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
          <LoginForm onSubmit={handleLogin} />
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          Acceso restringido a personal autorizado de KaledSoft
        </p>
      </div>
    </div>
  );
}
