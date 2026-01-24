export interface Program {
  id: string;
  name: string;
  description: string | null;
  totalValue: number;
  matriculaValue: number;
  modulesCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    students: number;
    prospects: number;
  };
}

export interface CreateProgramData {
  name: string;
  description?: string | null;
  totalValue: number;
  matriculaValue: number;
  modulesCount: number;
  isActive?: boolean;
}

export interface UpdateProgramData {
  name?: string;
  description?: string | null;
  totalValue?: number;
  matriculaValue?: number;
  modulesCount?: number;
  isActive?: boolean;
}

export interface ProgramsListResponse {
  programs: Program[];
  total: number;
}
