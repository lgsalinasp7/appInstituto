"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

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

const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, "La contraseña debe tener al menos 8 caracteres")
            .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
            .regex(/[0-9]/, "Debe contener al menos un número"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
    token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(data: ResetPasswordData) {
        setIsLoading(true);
        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    password: data.password,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setIsSuccess(true);
                toast.success(result.message);
                setTimeout(() => {
                    router.push("/auth/login");
                }, 3000);
            } else {
                toast.error(result.error || "Error al restablecer la contraseña");
            }
        } catch (error) {
            toast.error("Error de conexión con el servidor");
        } finally {
            setIsLoading(false);
        }
    }

    if (isSuccess) {
        return (
            <div className="relative backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl border border-white/20 p-8 text-center max-w-md mx-auto">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-green-500" />
                <div className="flex justify-center mb-6">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-primary mb-4">¡Contraseña restablecida!</h2>
                <p className="text-gray-600 mb-8">
                    Tu contraseña ha sido actualizada exitosamente. Serás redirigido al inicio de sesión en unos segundos.
                </p>
                <Button className="w-full h-12 rounded-xl" onClick={() => router.push("/auth/login")}>
                    Ir al inicio de sesión ahora
                </Button>
            </div>
        );
    }

    return (
        <div className="relative backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl border border-white/20 overflow-hidden max-w-md mx-auto">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-blue-500 to-primary" />

            <div className="pt-8 pb-4 px-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="relative w-16 h-16">
                        <Image
                            src="/logo-instituto.png"
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-primary mb-2">Nueva contraseña</h1>
                <p className="text-sm text-gray-500">
                    Por favor ingresa tu nueva contraseña segura.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="px-8 pb-8 space-y-5">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-primary font-semibold text-sm">Contraseña</FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pl-12 pr-12 h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary transition-all"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                                <FormLabel className="text-primary font-semibold text-sm">Confirmar contraseña</FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pl-12 h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary transition-all"
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
                        className="w-full h-12 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? "Actualizando..." : "Restablecer contraseña"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
