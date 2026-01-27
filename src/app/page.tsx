import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/brand";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center bg-gradient-instituto relative overflow-hidden">
        {/* Patrón decorativo sutil */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/20" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/10" />
        </div>

        <Card className="w-full max-w-md mx-4 shadow-instituto-lg animate-fade-in-up relative z-10 border-0">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-6">
              <Logo size="xl" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              Bienvenido
            </CardTitle>
            <CardDescription className="text-base">
              Sistema de gestión institucional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="flex justify-center">
              <Button
                asChild
                className="w-full max-w-xs bg-primary hover:bg-primary-light text-white"
              >
                <Link href="/auth/login">Iniciar Sesión</Link>
              </Button>

            </div>

          </CardContent>
        </Card>
      </div>

      {/* Footer minimalista */}
      <footer className="py-4 text-center text-sm text-white/70 bg-primary-dark">
        © {new Date().getFullYear()} Educamos con Valores. Todos los derechos reservados.
      </footer>
    </main>
  );
}
