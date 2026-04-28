"use client";

import { useState, useCallback } from "react";
import { tenantFetch } from "@/lib/tenant-fetch";
import type { PaymentCommitmentData } from "../types";

export interface CreateCommitmentPayload {
  studentId: string;
  scheduledDate: Date | string;
  amount: number;
  comments?: string;
  moduleNumber?: number;
}

export interface UpdateCommitmentPayload {
  scheduledDate?: Date | string;
  amount?: number;
  status?: "PAGADO" | "PENDIENTE" | "EN_COMPROMISO";
  rescheduledDate?: Date | string | null;
  comments?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: unknown;
  message?: string;
}

interface ListResult {
  items: PaymentCommitmentData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Hook para listar compromisos de pago del tenant actual.
 */
export function useCarteraCommitments() {
  const [items, setItems] = useState<PaymentCommitmentData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommitments = useCallback(
    async (params?: {
      studentId?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const sp = new URLSearchParams();
        if (params?.studentId) sp.set("studentId", params.studentId);
        if (params?.status) sp.set("status", params.status);
        if (params?.page) sp.set("page", String(params.page));
        if (params?.limit) sp.set("limit", String(params.limit));

        const res = await tenantFetch(
          `/api/payment-commitments?${sp.toString()}`
        );
        const json: ApiResponse<ListResult> = await res.json();
        if (!json.success || !json.data) {
          throw new Error(
            typeof json.error === "string" ? json.error : "Error al cargar"
          );
        }
        setItems(json.data.items);
        setTotal(json.data.total);
        return json.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { items, total, loading, error, fetchCommitments };
}

/**
 * Hook para crear un compromiso.
 */
export function useCreateCommitment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (payload: CreateCommitmentPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await tenantFetch("/api/payment-commitments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json: ApiResponse<PaymentCommitmentData> = await res.json();
      if (!json.success || !json.data) {
        const msg =
          typeof json.error === "string"
            ? json.error
            : "Error al crear compromiso";
        throw new Error(msg);
      }
      return json.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}

export function useUpdateCommitment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (id: string, payload: UpdateCommitmentPayload) => {
      setLoading(true);
      setError(null);
      try {
        const res = await tenantFetch(`/api/payment-commitments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json: ApiResponse<PaymentCommitmentData> = await res.json();
        if (!json.success || !json.data) {
          const msg =
            typeof json.error === "string"
              ? json.error
              : "Error al actualizar compromiso";
          throw new Error(msg);
        }
        return json.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { update, loading, error };
}

export function useCancelCommitment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await tenantFetch(`/api/payment-commitments/${id}`, {
        method: "DELETE",
      });
      const json: ApiResponse<unknown> = await res.json();
      if (!json.success) {
        const msg =
          typeof json.error === "string"
            ? json.error
            : "Error al cancelar compromiso";
        throw new Error(msg);
      }
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { cancel, loading, error };
}
