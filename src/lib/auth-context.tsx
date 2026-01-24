"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
}

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  isAdvisor: boolean;
  advisorId: string | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("auth_user");
    }
  }, [user]);

  const isAdmin = user?.role?.name === "admin" || 
                  user?.role?.permissions?.includes("admin:full") || 
                  false;
  
  const isAdvisor = user?.role?.name === "advisor" || 
                   user?.role?.name === "asesor" || 
                   !isAdmin;

  const advisorId = isAdmin ? null : user?.id || null;

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      isAdvisor, 
      advisorId,
      isLoading,
      setUser 
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
