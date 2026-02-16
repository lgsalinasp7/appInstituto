/**
 * RevenueChart component tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RevenueChart } from "@/modules/dashboard/components/RevenueChart";
import { BrandingProvider } from "@/components/providers/BrandingContext";
import type { RevenueData } from "@/modules/dashboard/types";

// Recharts ResponsiveContainer needs a parent with dimensions
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ data, children }: { data: RevenueData[]; children: React.ReactNode }) => (
    <div data-testid="bar-chart" data-length={data.length}>
      {children}
    </div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

const mockData: RevenueData[] = [
  { name: "Sem 1", total: 5000000 },
  { name: "Sem 2", total: 7500000 },
  { name: "Sem 3", total: 6000000 },
];

function renderRevenueChart(data: RevenueData[] = mockData) {
  return render(
    <BrandingProvider branding={{ tenantName: "Test", darkMode: false }}>
      <RevenueChart data={data} />
    </BrandingProvider>
  );
}

describe("RevenueChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el título Crecimiento de Ingresos", () => {
    renderRevenueChart();

    expect(screen.getByText("Crecimiento de Ingresos")).toBeInTheDocument();
  });

  it("renderiza el selector de período", () => {
    renderRevenueChart();

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Últimos 30 días")).toBeInTheDocument();
  });

  it("renderiza el chart con los datos proporcionados", () => {
    renderRevenueChart(mockData);

    expect(screen.getByTestId("bar-chart")).toHaveAttribute("data-length", "3");
  });

  it("renderiza con array vacío", () => {
    renderRevenueChart([]);

    expect(screen.getByTestId("bar-chart")).toHaveAttribute("data-length", "0");
  });
});
