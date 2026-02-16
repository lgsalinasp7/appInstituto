import { describe, it, expect, afterEach } from "vitest";
import { cn, formatCurrency, parseCurrency, getAdminUrl } from "@/lib/utils";

describe("cn", () => {
  it("combina clases correctamente", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("maneja clases condicionales", () => {
    expect(cn("base", false && "hidden", true && "visible")).toBe("base visible");
  });

  it("fusiona clases de Tailwind conflictivas", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("formatCurrency", () => {
  it("formatea números en formato colombiano", () => {
    expect(formatCurrency(1000000)).toBe("1.000.000");
  });

  it("retorna string vacío para null/undefined", () => {
    expect(formatCurrency(null)).toBe("");
    expect(formatCurrency(undefined)).toBe("");
    expect(formatCurrency("")).toBe("");
  });

  it("parsea strings con formato de moneda", () => {
    expect(formatCurrency("$1.500.000")).toBe("1.500.000");
  });

  it("retorna vacío para NaN", () => {
    expect(formatCurrency("abc")).toBe("");
  });
});

describe("parseCurrency", () => {
  it("extrae números de strings", () => {
    expect(parseCurrency("$1.500.000")).toBe(1500000);
  });

  it("retorna 0 para string vacío", () => {
    expect(parseCurrency("")).toBe(0);
  });

  it("maneja solo dígitos", () => {
    expect(parseCurrency("12345")).toBe(12345);
  });
});

describe("getAdminUrl", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("retorna URL de desarrollo en NODE_ENV=development", () => {
    process.env.NODE_ENV = "development";
    expect(getAdminUrl()).toBe("http://admin.localhost:3000/login");
  });

  it("retorna URL de producción en NODE_ENV=production", () => {
    process.env.NODE_ENV = "production";
    expect(getAdminUrl()).toBe("https://admin.kaledsoft.tech/login");
  });
});
