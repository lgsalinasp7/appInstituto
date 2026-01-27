"use client";

/**
 * Register Page
 * Renders the registration form from the auth module
 */

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RegisterForm, type RegisterFormData } from "@/modules/auth";

export default function RegisterPage() {
  const router = useRouter();

  async function handleRegister(data: RegisterFormData) {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "Error al crear la cuenta");
        return;
      }

      toast.success("Cuenta creada exitosamente. Por favor inicia sesión.");
      router.push("/auth/login");
    } catch (error) {
      console.error("Register error:", error);
      toast.error("Error de conexión. Intenta de nuevo.");
    }
  }

  return <RegisterForm onSubmit={handleRegister} />;
}
