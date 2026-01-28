import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === "" || value === undefined || value === null) return "";
  const numberValue = typeof value === "string"
    ? parseFloat(value.replace(/\D/g, ""))
    : value;

  if (isNaN(numberValue)) return "";

  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  }).format(numberValue);
}

export function parseCurrency(value: string): number {
  if (!value) return 0;
  // Remove anything that isn't a digit
  const numeric = value.replace(/\D/g, "");
  return numeric ? parseInt(numeric, 10) : 0;
}
