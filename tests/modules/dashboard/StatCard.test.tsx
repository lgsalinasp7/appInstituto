/**
 * StatCard component tests
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "@/modules/dashboard/components/StatCard";
import { BrandingProvider } from "@/components/providers/BrandingContext";
import { TrendingUp } from "lucide-react";

function renderStatCard(props: {
  title?: string;
  value?: string;
  trend?: "up" | "down";
  trendValue?: string;
  gradient?: string;
}) {
  return render(
    <BrandingProvider branding={{ tenantName: "Test", darkMode: false }}>
      <StatCard
        title={props.title ?? "Ingresos"}
        value={props.value ?? "$1.500.000"}
        icon={TrendingUp}
        gradient={props.gradient ?? "from-blue-500 to-cyan-500"}
        trend={props.trend}
        trendValue={props.trendValue}
      />
    </BrandingProvider>
  );
}

describe("StatCard", () => {
  it("renderiza título y valor", () => {
    renderStatCard({ title: "Estudiantes", value: "120" });

    expect(screen.getByText("Estudiantes")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
  });

  it("muestra indicador de tendencia cuando se proporciona", () => {
    renderStatCard({ trend: "up", trendValue: "+12%" });

    expect(screen.getByText(/↑ \+12%/)).toBeInTheDocument();
  });

  it("muestra tendencia down correctamente", () => {
    renderStatCard({ trend: "down", trendValue: "-5%" });

    expect(screen.getByText(/↓ -5%/)).toBeInTheDocument();
  });

  it("no muestra tendencia cuando no se proporciona", () => {
    renderStatCard({});

    expect(screen.queryByText(/↑/)).not.toBeInTheDocument();
    expect(screen.queryByText(/↓/)).not.toBeInTheDocument();
  });
});
