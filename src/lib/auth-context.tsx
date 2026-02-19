"use client";

import { useMemo, useCallback } from "react";
import { useAuthStore } from "@/lib/store/auth-store";

export function useAdvisorFilter() {
  const user = useAuthStore((state) => state.user);

  const userId = user?.id ?? null;
  const roleName = user?.role?.name ?? null;
  const platformRole = user?.platformRole ?? null;
  const permissions = user?.role?.permissions;

  const isAdmin = useMemo(() => {
    return !!platformRole ||
      roleName === "SUPERADMIN" ||
      roleName === "ADMINISTRADOR" ||
      (permissions?.includes("admin:full") ?? false);
  }, [platformRole, roleName, permissions]);

  const isVentas = roleName === "VENTAS";
  const advisorId = isVentas ? userId : null;

  const getFilterParams = useCallback(() => {
    if (isAdmin) return {};
    return { advisorId: advisorId || undefined };
  }, [isAdmin, advisorId]);

  const appendToUrl = useCallback((baseUrl: string) => {
    if (isAdmin || !advisorId) return baseUrl;
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}advisorId=${advisorId}`;
  }, [isAdmin, advisorId]);

  return {
    shouldFilter: !isAdmin,
    advisorId,
    getFilterParams,
    appendToUrl,
  };
}
