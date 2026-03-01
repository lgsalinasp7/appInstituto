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
      login(result.user);
      toast.success(`Bienvenido, ${result.user.name}`);

      if (result.user.mustChangePassword) {
        router.push("/auth/change-password");
        return;
      }

      const academyRoles = ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"];
      const isAcademyUser =
        result.user.tenant?.slug === "kaledacademy" &&
        result.user.platformRole &&
        academyRoles.includes(result.user.platformRole);

      router.push(isAcademyUser ? "/academia" : "/dashboard");
    } else {
      toast.error(result.message || "Error al iniciar sesión");
    }
  }

  return <LoginForm onSubmit={handleLogin} variant="split" />;
}
