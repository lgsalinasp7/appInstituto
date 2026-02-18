"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  tenantId: string | null;
  platformRole: string | null;
  role: {
    id: string;
    name: string;
    permissions: string[];
  } | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  isAdvisor: boolean;
  advisorId: string | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "auth_user:v1";

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    // Migrar desde clave sin versión
    const legacy = localStorage.getItem("auth_user");
    if (legacy) {
      localStorage.removeItem("auth_user");
      localStorage.setItem(AUTH_STORAGE_KEY, legacy);
      return JSON.parse(legacy);
    }
  } catch {
    try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch {}
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  // Función para validar sesión con el servidor
  const refreshUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include", // Incluir cookies
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData)); } catch {}
      } else {
        // Sesión inválida o expirada
        setUser(null);
        try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch {}
      }
    } catch (error) {
      console.error("Error al validar sesión:", error);
      // En caso de error de red, mantener el usuario de localStorage
      // pero marcar como no cargando
    } finally {
      setIsLoading(false);
    }
  };

  // Validar sesión al montar el componente
  useEffect(() => {
    refreshUser();
  }, []);

  // Sincronizar con localStorage cuando cambia el usuario
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {}
  }, [user]);

  const isPlatformUser = !!user?.platformRole;
  const isAdmin = isPlatformUser ||
                  user?.role?.name === "SUPERADMIN" || 
                  user?.role?.name === "ADMINISTRADOR" ||
                  user?.role?.permissions?.includes("admin:full") || 
                  false;
  
  const isVentas = user?.role?.name === "VENTAS";
  const isAdvisor = isVentas ||
                   user?.role?.name === "CARTERA" ||
                   (!isAdmin && !isPlatformUser);

  // Solo VENTAS debe tener advisorId forzado (CARTERA ve todos los datos)
  const advisorId = isVentas ? (user?.id || null) : null;

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      isAdvisor, 
      advisorId,
      isLoading,
      setUser,
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAdvisorFilter() {
  const { isAdmin, advisorId } = useAuth();
  
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
