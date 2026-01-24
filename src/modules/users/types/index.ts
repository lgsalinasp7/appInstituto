/**
 * Users Module Types
 * Defines all TypeScript interfaces for user management
 */

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: {
    id: string;
    name: string;
  };
  profile?: UserProfile | null;
}

export interface UserProfile {
  id: string;
  bio: string | null;
  phone: string | null;
  address: string | null;
  dateOfBirth: Date | null;
}

export interface UpdateUserData {
  name?: string;
  image?: string;
}

export interface UpdateProfileData {
  bio?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
}

export interface UsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
