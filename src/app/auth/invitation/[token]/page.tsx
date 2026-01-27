"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";

interface InvitationData {
  email: string;
  role: {
    id: string;
    name: string;
    description: string | null;
  };
  inviter: {
    name: string | null;
    email: string;
  };
  expiresAt: string;
}

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validate token on mount
  useEffect(() => {
    async function validateToken() {
      try {
        const response = await fetch(`/api/invitations/accept?token=${token}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.error);
        } else {
          setInvitation(data.data);
        }
      } catch {
        setError("Error al validar la invitación");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      validateToken();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error);
      } else {
        setSuccess(true);
        toast.success("Cuenta creada exitosamente");
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      }
    } catch {
      toast.error("Error al crear la cuenta");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="mt-4 text-muted-foreground">Validando invitación...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-semibold">Invitación Inválida</h2>
            <p className="mt-2 text-center text-muted-foreground">{error}</p>
            <Button
              className="mt-6"
              onClick={() => router.push("/auth/login")}
            >
              Ir al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <h2 className="mt-4 text-xl font-semibold">Cuenta Creada</h2>
            <p className="mt-2 text-center text-muted-foreground">
              Tu cuenta ha sido creada exitosamente. Redirigiendo al login...
            </p>
            <Button
              className="mt-6"
              onClick={() => router.push("/auth/login")}
            >
              Ir al Login Ahora
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Aceptar Invitación
          </CardTitle>
          <CardDescription className="text-center">
            Completa tu información para crear tu cuenta
          </CardDescription>
        </CardHeader>

        <CardContent>
          {invitation && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Email:</span> {invitation.email}
              </p>
              <p className="text-sm">
                <span className="font-medium">Rol:</span> {invitation.role.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Invitado por:</span>{" "}
                {invitation.inviter.name || invitation.inviter.email}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
