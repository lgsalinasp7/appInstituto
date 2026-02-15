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
import { BrandingProvider } from "@/components/providers/BrandingContext";
import Image from "next/image";

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
    <BrandingProvider branding={{ darkMode: true, tenantName: "KaledSoft Admin" }}>
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative background elements matching landing page */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative w-full max-w-md z-10">
          {/* Header */}
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="relative w-24 h-24 mb-6">
              <Image
                src="/kaledsoft-logo-transparent.png"
                alt="KaledSoft Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
              KaledSoft Admin
            </h1>
            <p className="text-gray-400">Portal de administración de la plataforma</p>
          </div>

          {/* Login Form - el componente LoginForm ya tiene su propio card con estilos */}
          <LoginForm onSubmit={handleLogin} />

          <p className="text-center text-xs text-gray-500 mt-8">
            Acceso restringido a personal autorizado de KaledSoft
          </p>
        </div>
      </div>
    </BrandingProvider>
  );
}
