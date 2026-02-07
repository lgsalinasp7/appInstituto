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

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const storedUser = localStorage.getItem("auth_user");
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("auth_user");
    }
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
        localStorage.setItem("auth_user", JSON.stringify(userData));
      } else {
        // Sesión inválida o expirada
        setUser(null);
        localStorage.removeItem("auth_user");
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
    if (user) {
      localStorage.setItem("auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("auth_user");
    }
  }, [user]);

  const isPlatformUser = !!user?.platformRole;
  const isAdmin = isPlatformUser ||
                  user?.role?.name === "SUPERADMIN" || 
                  user?.role?.name === "ADMINISTRADOR" ||
                  user?.role?.permissions?.includes("admin:full") || 
                  false;
  
  const isAdvisor = user?.role?.name === "VENTAS" || 
                   user?.role?.name === "CARTERA" || 
                   (!isAdmin && !isPlatformUser);

  const advisorId = isAdmin ? null : user?.id || null;

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
