"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdvisorFilter } from "@/lib/auth-context";

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseFetchOptions {
  applyAdvisorFilter?: boolean;
}

export function useDataFetch<T>(
  url: string,
  options: UseFetchOptions = { applyAdvisorFilter: true }
) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const { appendToUrl, shouldFilter } = useAdvisorFilter();

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const finalUrl = options.applyAdvisorFilter && shouldFilter
        ? appendToUrl(url)
        : url;

      const response = await fetch(finalUrl);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al cargar datos");
      }

      setState({
        data: result.data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }, [url, options.applyAdvisorFilter, shouldFilter, appendToUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}

export function useStudents(filters?: Record<string, string>) {
  const queryParams = new URLSearchParams(filters).toString();
  const url = `/api/students${queryParams ? `?${queryParams}` : ""}`;
  return useDataFetch(url);
}

export function usePayments(filters?: Record<string, string>) {
  const queryParams = new URLSearchParams(filters).toString();
  const url = `/api/payments${queryParams ? `?${queryParams}` : ""}`;
  return useDataFetch(url);
}

export function useCarteraAlerts() {
  return useDataFetch("/api/cartera/alerts");
}

export function useCarteraSummary() {
  return useDataFetch("/api/cartera/summary");
}

export function useDashboardStats() {
  return useDataFetch("/api/reports/dashboard");
}

export function useRevenueChart(period: "week" | "month" = "month") {
  return useDataFetch(`/api/reports/revenue-chart?period=${period}`);
}

export function useAdvisorReports() {
  return useDataFetch("/api/reports/advisors", { applyAdvisorFilter: false });
}

export function usePrograms() {
  return useDataFetch("/api/programs", { applyAdvisorFilter: false });
}
