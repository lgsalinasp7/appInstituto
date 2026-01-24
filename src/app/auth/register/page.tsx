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
    // TODO: Implement actual registration logic with auth service
    console.log("Register attempt:", data);
    
    // Simulated registration success
    toast.success("Registro exitoso. Por favor inicia sesión.");
    router.push("/auth/login");
  }

  return <RegisterForm onSubmit={handleRegister} />;
}
