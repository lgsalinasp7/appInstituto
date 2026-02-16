"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoginForm, type LoginFormData } from "@/modules/auth";
import { loginAction } from "@/modules/auth/actions";
import { useAuthStore } from "@/lib/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  async function handleLogin(data: LoginFormData) {
    const result = await loginAction(data);

    if (result.success && result.user) {
      login(result.user); // Update Zustand Store
      toast.success(`Bienvenido, ${result.user.name}`);
      router.push(result.user.mustChangePassword ? "/auth/change-password" : "/dashboard");
    } else {
      toast.error(result.message || "Error al iniciar sesión");
    }
  }

  return <LoginForm onSubmit={handleLogin} />;
}
