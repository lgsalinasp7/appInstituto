import type { ProspectStatus } from "@prisma/client";

export type { ProspectStatus };

export interface ProspectFilters {
  search?: string;
  status?: ProspectStatus;
  programId?: string;
  advisorId?: string;
  page?: number;
  limit?: number;
}

export interface CreateProspectData {
  name: string;
  phone: string;
  email?: string;
  status?: ProspectStatus;
  observations?: string;
  programId?: string;
  advisorId: string;
}

export interface UpdateProspectData {
  name?: string;
  phone?: string;
  email?: string;
  status?: ProspectStatus;
  observations?: string;
  programId?: string;
}

export interface ProspectWithRelations {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: ProspectStatus;
  observations: string | null;
  programId: string | null;
  advisorId: string;
  createdAt: Date;
  updatedAt: Date;
  program: {
    id: string;
    name: string;
  } | null;
  advisor: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface ProspectsListResponse {
  prospects: ProspectWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProspectStats {
  total: number;
  byStatus: {
    status: ProspectStatus;
    count: number;
  }[];
  conversionRate: number;
  thisMonth: number;
}
