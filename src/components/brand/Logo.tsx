"use client";

/**
 * Logo Component
 * Componente del logo institucional "Educamos con Valores"
 */

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  variant?: "full" | "icon";
  theme?: "light" | "dark";
}

const sizes = {
  sm: { width: 40, height: 40, text: "text-sm" },
  md: { width: 56, height: 56, text: "text-base" },
  lg: { width: 72, height: 72, text: "text-lg" },
  xl: { width: 100, height: 100, text: "text-xl" },
};

export function Logo({
  className,
  size = "md",
  showText = true,
  variant = "full",
  theme = "light",
}: LogoProps) {
  const sizeConfig = sizes[size];
  const isDark = theme === "dark";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/logo-instituto.png"
        alt="Educamos con Valores"
        width={sizeConfig.width}
        height={sizeConfig.height}
        className="object-contain"
        priority
      />

      {showText && variant === "full" && (
        <div className="flex flex-col">
          <span
            className={cn(
              "font-black leading-tight tracking-tight",
              sizeConfig.text,
              isDark ? "text-white" : "text-[#1e3a5f]"
            )}
          >
            EDUTEC
          </span>
          <span className={cn(
            "text-[10px] font-bold leading-tight uppercase tracking-widest",
            isDark ? "text-white/70" : "text-gray-400"
          )}>
            Educamos con Valores
          </span>
        </div>
      )}
    </div>
  );
}
