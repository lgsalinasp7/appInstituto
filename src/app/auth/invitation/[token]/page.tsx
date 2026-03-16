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
import { getAcademyRoleLabel } from "@/lib/academy-role-labels";

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
  tenantSlug?: string;
  tenantName?: string;
  expiresAt: string;
  academyRole?: string | null;
}

function getTenantLoginUrl(tenantSlug?: string): string {
  if (!tenantSlug) return "/auth/login";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kaledsoft.tech";
  const isDev =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname.endsWith(".localhost"));
  return isDev
    ? `http://${tenantSlug}.localhost:3000/auth/login`
    : `https://${tenantSlug}.${rootDomain}/auth/login`;
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
        const data = await response.json().catch(() => null);

        if (!data) {
          setError("Error al validar la invitación. Verifica tu conexión e intenta de nuevo.");
          return;
        }

        if (!data.success) {
          setError(data.error || "Invitación inválida");
        } else {
          setInvitation(data.data);
        }
      } catch {
        setError("Error al validar la invitación. Verifica tu conexión e intenta de nuevo.");
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
        const loginUrl = getTenantLoginUrl(invitation?.tenantSlug);
        setTimeout(() => {
          window.location.href = loginUrl;
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
      <div className="relative min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 -left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 -right-[10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]" />
        </div>
        <Card className="relative z-10 w-full max-w-md bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-cyan-900/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            <p className="mt-4 text-slate-400">Validando invitación...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 -left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 -right-[10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]" />
        </div>
        <Card className="relative z-10 w-full max-w-md bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-cyan-900/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-red-400" />
            <h2 className="mt-4 text-xl font-semibold text-white">Invitación Inválida</h2>
            <p className="mt-2 text-center text-slate-400">{error}</p>
            <Button
              className="mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0"
              onClick={() => {
                window.location.href = getTenantLoginUrl(invitation?.tenantSlug);
              }}
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
      <div className="relative min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 -left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 -right-[10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]" />
        </div>
        <Card className="relative z-10 w-full max-w-md bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-cyan-900/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            <h2 className="mt-4 text-xl font-semibold text-white">Cuenta Creada</h2>
            <p className="mt-2 text-center text-slate-400">
              Tu cuenta ha sido creada exitosamente. Redirigiendo al login...
            </p>
            <Button
              className="mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0"
              onClick={() => {
                window.location.href = getTenantLoginUrl(invitation?.tenantSlug);
              }}
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
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-[10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      <Card className="relative z-10 w-full max-w-md overflow-hidden bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-cyan-900/10">
        <div className="h-2 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold text-center text-white">
            Aceptar Invitación
          </CardTitle>
          <CardDescription className="text-center text-slate-400">
            Completa tu información para crear tu cuenta
          </CardDescription>
        </CardHeader>

        <CardContent>
          {invitation && (
            <div className="mb-6 p-4 rounded-xl bg-slate-950/60 border border-slate-700/50 space-y-2">
              {invitation.tenantName && (
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-slate-400">Institución:</span> {invitation.tenantName}
                </p>
              )}
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-slate-400">Email:</span> {invitation.email}
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-slate-400">Rol:</span>{" "}
                {invitation.academyRole
                  ? getAcademyRoleLabel(invitation.academyRole)
                  : invitation.role.name}
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-slate-400">Invitado por:</span>{" "}
                {invitation.inviter.name || invitation.inviter.email}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-400 font-semibold text-xs uppercase tracking-wider">
                Nombre completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                className="bg-slate-950/60 border-slate-700/50 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/10 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-400 font-semibold text-xs uppercase tracking-wider">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-slate-950/60 border-slate-700/50 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/10 rounded-xl pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-cyan-400"
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
              <Label htmlFor="confirmPassword" className="text-slate-400 font-semibold text-xs uppercase tracking-wider">
                Confirmar contraseña
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-slate-950/60 border-slate-700/50 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/10 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 font-bold py-6 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all"
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
