"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  phone: string;
  message: string;
  className?: string;
  size?: "sm" | "md";
  label?: string;
}

export function WhatsAppButton({
  phone,
  message,
  className,
  size = "md",
  label = "WhatsApp",
}: WhatsAppButtonProps) {
  const cleanPhone = phone.replace(/\D/g, "");
  const phoneWithCountry = cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`;
  const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors",
        "bg-green-600 text-white hover:bg-green-700",
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm",
        className
      )}
    >
      <MessageCircle size={size === "sm" ? 14 : 16} />
      {label}
    </a>
  );
}
