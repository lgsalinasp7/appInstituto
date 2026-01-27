import { create } from "zustand";
import { persist } from "zustand/middleware";

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

// Helper to sync auth state with cookie for middleware
const syncAuthCookie = (isAuthenticated: boolean, state: { user: AuthUser | null }) => {
    if (typeof document === "undefined") return;

    const cookieValue = JSON.stringify({
        state: {
            isAuthenticated,
            user: state.user ? { id: state.user.id, email: state.user.email } : null,
        },
    });

    if (isAuthenticated) {
        // Set cookie with 7 day expiry
        document.cookie = `auth-storage=${encodeURIComponent(cookieValue)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    } else {
        // Clear cookie
        document.cookie = "auth-storage=; path=/; max-age=0";
    }
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: (user) => {
                set({ user, isAuthenticated: true });
                syncAuthCookie(true, { user });
            },
            logout: () => {
                set({ user: null, isAuthenticated: false });
                syncAuthCookie(false, { user: null });
            },
            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                })),
        }),
        {
            name: "auth-storage-local", // localStorage key (renamed to avoid conflict)
        }
    )
);
