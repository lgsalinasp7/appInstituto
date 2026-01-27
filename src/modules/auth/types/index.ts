/**
 * Auth Module Types
 * Defines all TypeScript interfaces and types for authentication
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

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

export interface AuthSession {
  user: AuthUser;
  expires: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
}
