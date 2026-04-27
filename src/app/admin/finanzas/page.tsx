"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, BriefcaseBusiness, GraduationCap, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { tenantFetch } from "@/lib/tenant-fetch";

type FinanceTab = "saas" | "academia";
type SaveAction = "sale" | "schedule" | "cohort-cost" | null;
type DeleteAction = "sale" | "schedule" | "cohort-cost" | null;

type ExecutiveData = {
  totalRevenue: number;
  totalCost: number;
  grossMargin: number;
  grossMarginPct: number;
  softwareRevenueCashIn: number;
  softwareRevenueProrated: number;
  academyRevenue: number;
  academyCost: number;
  academyAdsCost: number;
  activeCohorts: number;
};

type SaasData = {
  cashIn: number;
  prorated: number;
  totalClosedSales: number;
  sales: Array<{
    id: string;
    customerName: string;
    productName: string;
    planName: string | null;
    saleDate: string;
    contractStartDate: string;
    contractEndDate: string;
    amountCop: number;
    collectedAmountCop: number;
    status: string;
    paymentStatus: string;
  }>;
};

type CohortsData = {
  cohorts: Array<{
    cohortId: string;
    cohortName: string;
    courseTitle: string;
    status: string;
    students: number;
    totalRevenue: number;
    paidRevenue: number;
    totalCost: number;
    adsCost: number;
    grossMargin: number;
    marginPct: number;
    cac: number;
    roi: number;
  }>;
  totals: {
    revenue: number;
    cost: number;
    margin: number;
  };
};

type CohortCostAllocation = {
  id: string;
  cohortId: string;
  cohortName: string;
  courseTitle: string;
  category: string;
  sourceType: string;
  label: string;
  amountCop: number;
  allocationDate: string;
  monthIndex: number | null;
  notes: string | null;
};

type SaasScheduleRow = {
  id: string;
  softwareSaleId: string;
  saleLabel: string;
  mode: string;
  periodStart: string;
  periodEnd: string;
  recognizedAmountCop: number;
};

function formatMoney(value: number): string {
  return `$${(value || 0).toLocaleString("es-CO")}`;
}

function formatPercent(value: number): string {
  return `${(value || 0).toFixed(1)}%`;
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function AdminFinanzasPage() {
  const [activeTab, setActiveTab] = useState<FinanceTab>("saas");
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState<SaveAction>(null);
  const [deletingAction, setDeletingAction] = useState<DeleteAction>(null);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCohortCostModalOpen, setIsCohortCostModalOpen] = useState(false);
  const [executive, setExecutive] = useState<ExecutiveData | null>(null);
  const [saas, setSaas] = useState<SaasData | null>(null);
  const [schedules, setSchedules] = useState<SaasScheduleRow[]>([]);
  const [cohorts, setCohorts] = useState<CohortsData | null>(null);
  const [cohortAllocations, setCohortAllocations] = useState<CohortCostAllocation[]>([]);
  const [saleForm, setSaleForm] = useState({
    customerName: "",
    productName: "",
    planName: "",
    saleDate: "",
    contractStartDate: "",
    contractEndDate: "",
    amountCop: "",
    collectedAmountCop: "",
    notes: "",
  });
  const [scheduleForm, setScheduleForm] = useState({
    softwareSaleId: "",
    periodStart: "",
    periodEnd: "",
    recognizedAmountCop: "",
  });
  const [cohortCostForm, setCohortCostForm] = useState({
    cohortId: "",
    category: "ADS",
    sourceType: "MANUAL",
    label: "",
    amountCop: "",
    allocationDate: "",
    monthIndex: "",
    notes: "",
  });

  const refreshFinanceData = useCallback(async () => {
    setLoading(true);
    try {
      const [executiveRes, saasRes, schedulesRes, cohortsRes, cohortCostsRes] = await Promise.all([
        tenantFetch("/api/admin/finance/executive"),
        tenantFetch("/api/admin/finance/saas"),
        tenantFetch("/api/admin/finance/schedules"),
        tenantFetch("/api/admin/finance/cohorts"),
        tenantFetch("/api/admin/finance/cohort-costs"),
      ]);

      const [executiveJson, saasJson, schedulesJson, cohortsJson, cohortCostsJson] = await Promise.all([
        executiveRes.json(),
        saasRes.json(),
        schedulesRes.json(),
        cohortsRes.json(),
        cohortCostsRes.json(),
      ]);

      if (executiveJson?.success) setExecutive(executiveJson.data);
      if (saasJson?.success) setSaas(saasJson.data);
      if (schedulesJson?.success) setSchedules(schedulesJson.data);
      if (cohortsJson?.success) setCohorts(cohortsJson.data);
      if (cohortCostsJson?.success) setCohortAllocations(cohortCostsJson.data);
    } catch (error) {
      console.error("Error cargando finanzas admin:", error);
      toast.error("No se pudieron cargar los indicadores financieros.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshFinanceData();
  }, [refreshFinanceData]);

  const saleOptions = useMemo(() => {
    if (!saas) return [];
    return saas.sales.map((sale) => ({
      id: sale.id,
      label: `${sale.customerName} - ${sale.productName}`,
    }));
  }, [saas]);

  const cohortOptions = useMemo(() => {
    if (!cohorts) return [];
    return cohorts.cohorts.map((cohort) => ({
      id: cohort.cohortId,
      label: `${cohort.cohortName} - ${cohort.courseTitle}`,
    }));
  }, [cohorts]);

  const kpiCards = useMemo(() => {
    if (!executive) return [];
    return [
      {
        label: "Ingresos Totales",
        value: formatMoney(executive.totalRevenue),
        tone: "bg-emerald-500/10 border-emerald-500/20 text-emerald-200",
      },
      {
        label: "Costo Total",
        value: formatMoney(executive.totalCost),
        tone: "bg-amber-500/10 border-amber-500/20 text-amber-200",
      },
      {
        label: "Margen Bruto",
        value: `${formatMoney(executive.grossMargin)} (${formatPercent(executive.grossMarginPct)})`,
        tone: "bg-cyan-500/10 border-cyan-500/20 text-cyan-200",
      },
    ];
  }, [executive]);

  const handleCreateSale = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingAction("sale");
    try {
      const response = await tenantFetch("/api/admin/finance/saas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...saleForm,
          amountCop: toNumber(saleForm.amountCop),
          collectedAmountCop: toNumber(saleForm.collectedAmountCop),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.error ?? "No se pudo registrar la venta SaaS.");
      }
      toast.success("Venta SaaS registrada.");
      setIsSaleModalOpen(false);
      setSaleForm({
        customerName: "",
        productName: "",
        planName: "",
        saleDate: "",
        contractStartDate: "",
        contractEndDate: "",
        amountCop: "",
        collectedAmountCop: "",
        notes: "",
      });
      await refreshFinanceData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo registrar la venta SaaS.";
      toast.error(message);
    } finally {
      setSavingAction(null);
    }
  };

  const handleCreateSchedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingAction("schedule");
    try {
      const response = await tenantFetch("/api/admin/finance/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...scheduleForm,
          recognizedAmountCop: toNumber(scheduleForm.recognizedAmountCop),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.error ?? "No se pudo registrar el prorrateo.");
      }
      toast.success("Prorrateo registrado.");
      setIsScheduleModalOpen(false);
      setScheduleForm({
        softwareSaleId: "",
        periodStart: "",
        periodEnd: "",
        recognizedAmountCop: "",
      });
      await refreshFinanceData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo registrar el prorrateo.";
      toast.error(message);
    } finally {
      setSavingAction(null);
    }
  };

  const handleCreateCohortCost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingAction("cohort-cost");
    try {
      const response = await tenantFetch("/api/admin/finance/cohort-costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...cohortCostForm,
          amountCop: toNumber(cohortCostForm.amountCop),
          monthIndex: cohortCostForm.monthIndex ? Number(cohortCostForm.monthIndex) : null,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.error ?? "No se pudo registrar el costo de cohorte.");
      }
      toast.success("Costo de cohorte registrado.");
      setIsCohortCostModalOpen(false);
      setCohortCostForm({
        cohortId: "",
        category: "ADS",
        sourceType: "MANUAL",
        label: "",
        amountCop: "",
        allocationDate: "",
        monthIndex: "",
        notes: "",
      });
      await refreshFinanceData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo registrar el costo de cohorte.";
      toast.error(message);
    } finally {
      setSavingAction(null);
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar esta venta? También se eliminarán sus prorrateos asociados."
    );
    if (!confirmed) return;

    setDeletingAction("sale");
    try {
      const response = await tenantFetch(`/api/admin/finance/saas?saleId=${encodeURIComponent(saleId)}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.error ?? "No se pudo eliminar la venta.");
      }
      toast.success("Venta eliminada correctamente.");
      await refreshFinanceData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar la venta.";
      toast.error(message);
    } finally {
      setDeletingAction(null);
    }
  };

  const handleDeleteCohortCost = async (allocationId: string) => {
    const confirmed = window.confirm("¿Seguro que deseas eliminar este costo de cohorte?");
    if (!confirmed) return;

    setDeletingAction("cohort-cost");
    try {
      const response = await tenantFetch(
        `/api/admin/finance/cohort-costs?allocationId=${encodeURIComponent(allocationId)}`,
        { method: "DELETE" }
      );
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.error ?? "No se pudo eliminar el costo.");
      }
      toast.success("Costo de cohorte eliminado.");
      await refreshFinanceData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar el costo.";
      toast.error(message);
    } finally {
      setDeletingAction(null);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    const confirmed = window.confirm("¿Seguro que deseas eliminar este prorrateo?");
    if (!confirmed) return;

    setDeletingAction("schedule");
    try {
      const response = await tenantFetch(
        `/api/admin/finance/schedules?scheduleId=${encodeURIComponent(scheduleId)}`,
        { method: "DELETE" }
      );
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.error ?? "No se pudo eliminar el prorrateo.");
      }
      toast.success("Prorrateo eliminado.");
      await refreshFinanceData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar el prorrateo.";
      toast.error(message);
    } finally {
      setDeletingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-slate-800/70 pb-5">
        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300">
          <BarChart3 size={14} />
          Finanzas Plataforma
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">Finanzas KaledSoft</h1>
        <p className="text-sm text-slate-400">Vista ejecutiva SaaS + rentabilidad por cohorte de academia.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
          Cargando indicadores financieros...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {kpiCards.map((card) => (
              <div key={card.label} className={`rounded-2xl border p-5 shadow-sm ${card.tone}`}>
                <p className="text-xs font-bold uppercase tracking-wider opacity-80">{card.label}</p>
                <p className="mt-2 text-lg font-black">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="flex w-full overflow-x-auto rounded-xl bg-slate-900 p-1">
            <button
              onClick={() => setActiveTab("saas")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                activeTab === "saas"
                  ? "bg-slate-800 text-cyan-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BriefcaseBusiness size={16} />
              Vista SaaS
            </button>
            <button
              onClick={() => setActiveTab("academia")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                activeTab === "academia"
                  ? "bg-slate-800 text-cyan-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <GraduationCap size={16} />
              Vista Academia
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeTab === "saas" && (
              <>
                <Button
                  type="button"
                  variant="outline-dark"
                  onClick={() => setIsSaleModalOpen(true)}
                >
                  Nueva venta SaaS
                </Button>
                <Button
                  type="button"
                  variant="outline-dark"
                  onClick={() => setIsScheduleModalOpen(true)}
                >
                  Nuevo prorrateo
                </Button>
              </>
            )}
            {activeTab === "academia" && (
              <Button
                type="button"
                variant="outline-dark"
                onClick={() => setIsCohortCostModalOpen(true)}
              >
                Nuevo costo cohorte
              </Button>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4 shadow-sm sm:p-6">
            {activeTab === "saas" && saas && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Cash-in</p>
                    <p className="mt-2 text-2xl font-black text-emerald-100">{formatMoney(saas.cashIn)}</p>
                  </div>
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Prorrateado</p>
                    <p className="mt-2 text-2xl font-black text-cyan-100">{formatMoney(saas.prorated)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Ventas cerradas</p>
                    <p className="mt-2 text-2xl font-black text-white">{saas.totalClosedSales}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wider text-slate-400">
                        <th className="px-3 py-3">Cliente</th>
                        <th className="px-3 py-3">Producto</th>
                        <th className="px-3 py-3">Fecha venta</th>
                        <th className="px-3 py-3 text-right">Monto</th>
                        <th className="px-3 py-3 text-right">Cobrado</th>
                        <th className="px-3 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saas.sales.map((row) => (
                        <tr key={row.id} className="border-b border-slate-800 text-sm">
                          <td className="px-3 py-3 font-semibold text-slate-100">{row.customerName}</td>
                          <td className="px-3 py-3 text-slate-300">{row.productName}</td>
                          <td className="px-3 py-3 text-slate-300">{new Date(row.saleDate).toLocaleDateString("es-CO")}</td>
                          <td className="px-3 py-3 text-right font-semibold text-slate-200">{formatMoney(row.amountCop)}</td>
                          <td className="px-3 py-3 text-right font-semibold text-emerald-300">{formatMoney(row.collectedAmountCop)}</td>
                          <td className="px-3 py-3 text-right">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              disabled={deletingAction === "sale"}
                              onClick={() => void handleDeleteSale(row.id)}
                            >
                              Eliminar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Prorrateos registrados
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[920px]">
                      <thead>
                        <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wider text-slate-400">
                          <th className="px-3 py-3">Venta</th>
                          <th className="px-3 py-3">Inicio</th>
                          <th className="px-3 py-3">Fin</th>
                          <th className="px-3 py-3 text-right">Reconocido</th>
                          <th className="px-3 py-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedules.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-400">
                              No hay prorrateos registrados.
                            </td>
                          </tr>
                        )}
                        {schedules.map((schedule) => (
                          <tr key={schedule.id} className="border-b border-slate-800 text-sm">
                            <td className="px-3 py-3 text-slate-100">{schedule.saleLabel}</td>
                            <td className="px-3 py-3 text-slate-300">
                              {new Date(schedule.periodStart).toLocaleDateString("es-CO")}
                            </td>
                            <td className="px-3 py-3 text-slate-300">
                              {new Date(schedule.periodEnd).toLocaleDateString("es-CO")}
                            </td>
                            <td className="px-3 py-3 text-right font-semibold text-cyan-200">
                              {formatMoney(schedule.recognizedAmountCop)}
                            </td>
                            <td className="px-3 py-3 text-right">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={deletingAction === "schedule"}
                                onClick={() => void handleDeleteSchedule(schedule.id)}
                              >
                                Eliminar
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "academia" && cohorts && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-300">Ingreso cohorte</p>
                    <p className="mt-2 text-xl font-black text-blue-100">{formatMoney(cohorts.totals.revenue)}</p>
                  </div>
                  <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-orange-300">Costo cohorte</p>
                    <p className="mt-2 text-xl font-black text-orange-100">{formatMoney(cohorts.totals.cost)}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Margen cohorte</p>
                    <p className="mt-2 text-xl font-black text-emerald-100">{formatMoney(cohorts.totals.margin)}</p>
                  </div>
                  <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-violet-300">Cohortes activas</p>
                    <p className="mt-2 text-xl font-black text-violet-100">{executive?.activeCohorts ?? 0}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[920px]">
                    <thead>
                      <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wider text-slate-400">
                        <th className="px-3 py-3">Cohorte</th>
                        <th className="px-3 py-3">Curso</th>
                        <th className="px-3 py-3 text-right">Estudiantes</th>
                        <th className="px-3 py-3 text-right">Ingresos</th>
                        <th className="px-3 py-3 text-right">Costo</th>
                        <th className="px-3 py-3 text-right">Margen</th>
                        <th className="px-3 py-3 text-right">CAC</th>
                        <th className="px-3 py-3 text-right">ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cohorts.cohorts.map((row) => (
                        <tr key={row.cohortId} className="border-b border-slate-800 text-sm">
                          <td className="px-3 py-3 font-semibold text-slate-100">{row.cohortName}</td>
                          <td className="px-3 py-3 text-slate-300">{row.courseTitle}</td>
                          <td className="px-3 py-3 text-right text-slate-200">{row.students}</td>
                          <td className="px-3 py-3 text-right font-semibold text-slate-200">{formatMoney(row.totalRevenue)}</td>
                          <td className="px-3 py-3 text-right text-orange-300">{formatMoney(row.totalCost)}</td>
                          <td className="px-3 py-3 text-right font-semibold text-emerald-300">
                            <span className="inline-flex items-center gap-1">
                              <TrendingUp size={14} />
                              {formatMoney(row.grossMargin)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right text-slate-200">{formatMoney(row.cac)}</td>
                          <td className="px-3 py-3 text-right font-semibold text-violet-300">{row.roi.toFixed(2)}x</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Costos registrados (borrables)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[920px]">
                      <thead>
                        <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wider text-slate-400">
                          <th className="px-3 py-3">Cohorte</th>
                          <th className="px-3 py-3">Etiqueta</th>
                          <th className="px-3 py-3">Categoría</th>
                          <th className="px-3 py-3">Fecha</th>
                          <th className="px-3 py-3 text-right">Monto</th>
                          <th className="px-3 py-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cohortAllocations.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-400">
                              No hay costos de cohorte registrados.
                            </td>
                          </tr>
                        )}
                        {cohortAllocations.map((allocation) => (
                          <tr key={allocation.id} className="border-b border-slate-800 text-sm">
                            <td className="px-3 py-3 font-semibold text-slate-100">{allocation.cohortName}</td>
                            <td className="px-3 py-3 text-slate-300">{allocation.label}</td>
                            <td className="px-3 py-3 text-slate-300">{allocation.category}</td>
                            <td className="px-3 py-3 text-slate-300">
                              {new Date(allocation.allocationDate).toLocaleDateString("es-CO")}
                            </td>
                            <td className="px-3 py-3 text-right text-orange-300">
                              {formatMoney(allocation.amountCop)}
                            </td>
                            <td className="px-3 py-3 text-right">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={deletingAction === "cohort-cost"}
                                onClick={() => void handleDeleteCohortCost(allocation.id)}
                              >
                                Eliminar
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <Dialog open={isSaleModalOpen} onOpenChange={setIsSaleModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva venta SaaS</DialogTitle>
            <DialogDescription>Registra el cash-in de una venta de software tenant.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSale} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sale-customerName">Cliente</Label>
                <Input
                  id="sale-customerName"
                  value={saleForm.customerName}
                  onChange={(e) => setSaleForm((prev) => ({ ...prev, customerName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-productName">Producto</Label>
                <Input
                  id="sale-productName"
                  value={saleForm.productName}
                  onChange={(e) => setSaleForm((prev) => ({ ...prev, productName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-planName">Plan (opcional)</Label>
                <Input
                  id="sale-planName"
                  value={saleForm.planName}
                  onChange={(e) => setSaleForm((prev) => ({ ...prev, planName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-amountCop">Monto total (COP)</Label>
                <Input
                  id="sale-amountCop"
                  type="number"
                  min="1"
                  step="0.01"
                  value={saleForm.amountCop}
                  onChange={(e) => setSaleForm((prev) => ({ ...prev, amountCop: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-collectedAmountCop">Monto cobrado (COP)</Label>
                <Input
                  id="sale-collectedAmountCop"
                  type="number"
                  min="0"
                  step="0.01"
                  value={saleForm.collectedAmountCop}
                  onChange={(e) => setSaleForm((prev) => ({ ...prev, collectedAmountCop: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-saleDate">Fecha de venta</Label>
                <Input
                  id="sale-saleDate"
                  type="date"
                  value={saleForm.saleDate}
                  onChange={(e) => setSaleForm((prev) => ({ ...prev, saleDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-contractStartDate">Inicio contrato</Label>
                <Input
                  id="sale-contractStartDate"
                  type="date"
                  value={saleForm.contractStartDate}
                  onChange={(e) => setSaleForm((prev) => ({ ...prev, contractStartDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-contractEndDate">Fin contrato</Label>
                <Input
                  id="sale-contractEndDate"
                  type="date"
                  value={saleForm.contractEndDate}
                  onChange={(e) => setSaleForm((prev) => ({ ...prev, contractEndDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale-notes">Notas (opcional)</Label>
              <Textarea
                id="sale-notes"
                value={saleForm.notes}
                onChange={(e) => setSaleForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline-dark" onClick={() => setIsSaleModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={savingAction === "sale"}>
                {savingAction === "sale" ? "Guardando..." : "Guardar venta"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo prorrateo</DialogTitle>
            <DialogDescription>Registra ingreso prorrateado para una venta SaaS existente.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-softwareSaleId">Venta SaaS</Label>
              <select
                id="schedule-softwareSaleId"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                value={scheduleForm.softwareSaleId}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, softwareSaleId: e.target.value }))}
                required
              >
                <option value="">Selecciona una venta</option>
                {saleOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="schedule-periodStart">Inicio periodo</Label>
                <Input
                  id="schedule-periodStart"
                  type="date"
                  value={scheduleForm.periodStart}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, periodStart: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-periodEnd">Fin periodo</Label>
                <Input
                  id="schedule-periodEnd"
                  type="date"
                  value={scheduleForm.periodEnd}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, periodEnd: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-recognizedAmountCop">Monto reconocido (COP)</Label>
              <Input
                id="schedule-recognizedAmountCop"
                type="number"
                min="1"
                step="0.01"
                value={scheduleForm.recognizedAmountCop}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, recognizedAmountCop: e.target.value }))}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline-dark" onClick={() => setIsScheduleModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={savingAction === "schedule"}>
                {savingAction === "schedule" ? "Guardando..." : "Guardar prorrateo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCohortCostModalOpen} onOpenChange={setIsCohortCostModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo costo de cohorte</DialogTitle>
            <DialogDescription>Registra gastos de Ads y otros costos para rentabilidad por cohorte.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCohortCost} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cost-cohortId">Cohorte</Label>
              <select
                id="cost-cohortId"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                value={cohortCostForm.cohortId}
                onChange={(e) => setCohortCostForm((prev) => ({ ...prev, cohortId: e.target.value }))}
                required
              >
                <option value="">Selecciona una cohorte</option>
                {cohortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cost-category">Categoría</Label>
                <select
                  id="cost-category"
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                  value={cohortCostForm.category}
                  onChange={(e) => setCohortCostForm((prev) => ({ ...prev, category: e.target.value }))}
                  required
                >
                  <option value="ADS">ADS</option>
                  <option value="INSTRUCTOR">INSTRUCTOR</option>
                  <option value="PLATFORM">PLATFORM</option>
                  <option value="TOOLS">TOOLS</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost-sourceType">Tipo fuente</Label>
                <select
                  id="cost-sourceType"
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                  value={cohortCostForm.sourceType}
                  onChange={(e) => setCohortCostForm((prev) => ({ ...prev, sourceType: e.target.value }))}
                  required
                >
                  <option value="MANUAL">MANUAL</option>
                  <option value="CAMPAIGN">CAMPAIGN</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="cost-label">Etiqueta</Label>
                <Input
                  id="cost-label"
                  value={cohortCostForm.label}
                  onChange={(e) => setCohortCostForm((prev) => ({ ...prev, label: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost-amountCop">Monto (COP)</Label>
                <Input
                  id="cost-amountCop"
                  type="number"
                  min="1"
                  step="0.01"
                  value={cohortCostForm.amountCop}
                  onChange={(e) => setCohortCostForm((prev) => ({ ...prev, amountCop: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost-allocationDate">Fecha asignación</Label>
                <Input
                  id="cost-allocationDate"
                  type="date"
                  value={cohortCostForm.allocationDate}
                  onChange={(e) => setCohortCostForm((prev) => ({ ...prev, allocationDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost-monthIndex">Mes de cohorte (opcional)</Label>
                <Input
                  id="cost-monthIndex"
                  type="number"
                  min="1"
                  step="1"
                  value={cohortCostForm.monthIndex}
                  onChange={(e) => setCohortCostForm((prev) => ({ ...prev, monthIndex: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost-notes">Notas (opcional)</Label>
              <Textarea
                id="cost-notes"
                value={cohortCostForm.notes}
                onChange={(e) => setCohortCostForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline-dark" onClick={() => setIsCohortCostModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={savingAction === "cohort-cost"}>
                {savingAction === "cohort-cost" ? "Guardando..." : "Guardar costo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
