"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Logo } from "@/components/brand";

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

const forgotPasswordSchema = z.object({
    email: z.string().email("Correo electrónico inválido"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<ForgotPasswordData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(data: ForgotPasswordData) {
        setIsLoading(true);
        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                setIsSubmitted(true);
                toast.success(result.message);
            } else {
                toast.error(result.error || "Error al solicitar el restablecimiento");
            }
        } catch (error) {
            toast.error("Error de conexión con el servidor");
        } finally {
            setIsLoading(false);
        }
    }

    if (isSubmitted) {
        return (
            <div className="relative backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl shadow-black/20 border border-white/20 overflow-hidden p-8 text-center max-w-md mx-auto">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-blue-500 to-primary" />
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-primary mb-4">Revisa tu correo</h2>
                <p className="text-gray-600 mb-8">
                    Si el correo ingresado está registrado, hemos enviado un enlace para restablecer tu contraseña. El enlace expirará en 1 hora.
                </p>
                <Link href="/auth/login">
                    <Button className="w-full h-12 rounded-xl">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Volver al inicio de sesión
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="relative backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl shadow-black/20 border border-white/20 overflow-hidden max-w-md mx-auto">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-blue-500 to-primary" />

            <div className="pt-8 pb-4 px-8 text-center">
                <div className="flex justify-center mb-6">
                    <Logo size="lg" />
                </div>
                <h1 className="text-2xl font-bold text-primary mb-2">Restablecer contraseña</h1>
                <p className="text-sm text-gray-500">
                    Ingresa tu correo electrónico y te enviaremos un enlace para recuperar el acceso a tu cuenta.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="px-8 pb-8 space-y-6">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-primary font-semibold text-sm">
                                    Correo electrónico
                                </FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="email"
                                            placeholder="tu@email.com"
                                            className="pl-12 h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary transition-all"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-4">
                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? "Enviando..." : (
                                <span className="flex items-center justify-center gap-2">
                                    Enviar enlace
                                    <ArrowRight className="w-5 h-5" />
                                </span>
                            )}
                        </Button>

                        <Link href="/auth/login" className="flex items-center justify-center text-sm font-medium text-gray-500 hover:text-primary transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </form>
            </Form>
        </div>
    );
}
