import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Invitation } from "@prisma/client";

// Define Types aligned with schema
export type RoleType = "SUPERADMIN" | "ADMINISTRADOR" | "VENTAS" | "CARTERA" | "USER"; // Default USER

export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: {
        id: string;
        name: string;
        permissions: string[];
    };
    invitationLimit: number;
}

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    login: (user: AuthUser) => void;
    logout: () => void;
    updateUser: (updates: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                })),
        }),
        {
            name: "auth-storage", // localStorage key
        }
    )
);
