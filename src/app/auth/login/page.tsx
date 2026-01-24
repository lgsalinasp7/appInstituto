"use client";

/**
 * Login Page
 * Renders the login form from the auth module
 */

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoginForm, type LoginFormData } from "@/modules/auth";

export default function LoginPage() {
  const router = useRouter();

  async function handleLogin(data: LoginFormData) {
    // TODO: Implement actual login logic with auth service
    console.log("Login attempt:", data);
    
    // Simulated login success
    toast.success("Inicio de sesión exitoso");
    router.push("/dashboard");
  }

  return <LoginForm onSubmit={handleLogin} />;
}
