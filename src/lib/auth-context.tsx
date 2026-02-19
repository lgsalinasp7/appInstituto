"use client";

import { useAuthStore } from "@/lib/store/auth-store";

export function useAdvisorFilter() {
  const user = useAuthStore((state) => state.user);

  const isPlatformUser = !!user?.platformRole;
  const isAdmin = isPlatformUser ||
                  user?.role?.name === "SUPERADMIN" ||
                  user?.role?.name === "ADMINISTRADOR" ||
                  user?.role?.permissions?.includes("admin:full") ||
                  false;

  const isVentas = user?.role?.name === "VENTAS";
  const advisorId = isVentas ? (user?.id || null) : null;

  return {
    shouldFilter: !isAdmin,
    advisorId,
    getFilterParams: () => {
      if (isAdmin) return {};
      return { advisorId: advisorId || undefined };
    },
    appendToUrl: (baseUrl: string) => {
      if (isAdmin || !advisorId) return baseUrl;
      const separator = baseUrl.includes("?") ? "&" : "?";
      return `${baseUrl}${separator}advisorId=${advisorId}`;
    },
  };
}
