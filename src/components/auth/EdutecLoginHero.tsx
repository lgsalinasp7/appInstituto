"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface EdutecLoginHeroProps {
  logoUrl: string;
  tenantName: string;
}

/**
 * Hero ilustrativo para el login de Edutec.
 * Inspirado en diseño split: estudiante central, logo, formas orgánicas y paleta institucional.
 */
export function EdutecLoginHero({ logoUrl, tenantName }: EdutecLoginHeroProps) {
  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-screen flex items-center justify-center overflow-hidden bg-[#f8fafc]">
      {/* Fondo con gradiente radial suave */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 30% 50%, #e2e8f0 0%, #f1f5f9 50%, #f8fafc 100%)",
        }}
      />

      {/* Círculo de fondo lavanda/púrpura suave (como en la referencia) */}
      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full bg-[#dbeafe] opacity-80"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.8 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {/* Composición de Estudiantes */}
      <div className="relative z-10 w-full max-w-[600px] aspect-square flex items-center justify-center">

        {/* Estudiante Central (Principal) */}
        <motion.div
          className="relative z-20 w-[320px] h-[320px] rounded-full overflow-hidden border-8 border-white shadow-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Image
            src="/images/auth/edutec-central-student.png"
            alt="Estudiante Principal"
            fill
            className="object-cover scale-110 translate-y-4"
            priority
          />
        </motion.div>

        {/* Estudiante Órbita 1 (Arriba Derecha) */}
        <motion.div
          className="absolute top-[10%] right-[15%] z-30 w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-white shadow-xl"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5, type: "spring" }}
        >
          <Image
            src="/images/auth/edutec-student-branded.png"
            alt="Estudiante 2"
            fill
            className="object-cover scale-150"
          />
        </motion.div>

        {/* Estudiante Órbita 2 (Izquierda) */}
        <motion.div
          className="absolute top-[35%] left-[5%] z-30 w-[90px] h-[90px] rounded-full overflow-hidden border-4 border-white shadow-xl"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7, type: "spring" }}
        >
          <Image
            src="/images/auth/edutec-student-branded.png"
            alt="Estudiante 3"
            fill
            className="object-cover scale-150 translate-x-2"
          />
        </motion.div>

        {/* Elementos Decorativos: Líneas y Formas */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 600 600">
          <motion.path
            d="M300,300 L450,150"
            stroke="#ec4899"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 1 }}
          />
          <motion.path
            d="M300,300 L120,250"
            stroke="#f59e0b"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          />
        </svg>

        {/* Burbujas de Chat y otros iconos flotantes */}
        <motion.div
          className="absolute bottom-[30%] left-[10%] z-40 bg-indigo-600 rounded-2xl p-3 shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.4, type: "spring" }}
        >
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-white/40" />
            <div className="w-2 h-2 rounded-full bg-white/70" />
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        </motion.div>

        <motion.div
          className="absolute top-[40%] right-[10%] z-40 bg-slate-800 rounded-lg p-2 shadow-lg flex items-center gap-2"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <div className="w-8 h-1 bg-slate-600 rounded-full" />
          <div className="w-4 h-4 bg-white rounded-sm rotate-45 translate-x-1" />
        </motion.div>

        {/* Puntos de color */}
        <div className="absolute top-[25%] left-[30%] w-4 h-4 rounded-full bg-orange-400 opacity-80" />
        <div className="absolute bottom-[20%] right-[35%] w-6 h-6 rounded-full bg-pink-500 opacity-60" />
      </div>
    </div>
  );
}

