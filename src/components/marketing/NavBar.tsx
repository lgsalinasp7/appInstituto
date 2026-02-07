import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image
              src="/kaledsoft-logo.png"
              alt="KaledSoft Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
            KaledSoft
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link href="#services" className="hover:text-cyan-400 transition-colors">
            Servicios
          </Link>
          <Link href="#features" className="hover:text-cyan-400 transition-colors">
            Funcionalidades
          </Link>
          <Link href="#pricing" className="hover:text-cyan-400 transition-colors">
            Precios
          </Link>
          <Link href="#contact" className="hover:text-cyan-400 transition-colors">
            Contacto
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            asChild 
            variant="ghost" 
            className="text-gray-300 hover:text-white hover:bg-white/10"
          >
            <Link href="/auth/login">
              Portal Cliente
            </Link>
          </Button>
          <Button 
            asChild
            className="bg-cyan-600 hover:bg-cyan-500 text-white border-0 shadow-[0_0_15px_rgba(8,145,178,0.5)]"
          >
            <Link href="#contact">
              Cotizar Proyecto
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
