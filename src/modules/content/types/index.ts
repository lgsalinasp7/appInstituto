export interface AcademicContent {
  id: string;
  name: string;
  description: string | null;
  orderIndex: number;
  programId: string;
  createdAt: Date;
  updatedAt: Date;
  program?: {
    id: string;
    name: string;
  };
}

export interface ContentDelivery {
  id: string;
  deliveredAt: Date;
  method: string;
  studentId: string;
  contentId: string;
  student?: {
    id: string;
    fullName: string;
  };
  content?: {
    id: string;
    name: string;
  };
}

export interface CreateContentData {
  name: string;
  description?: string;
  orderIndex: number;
  programId: string;
}

export interface UpdateContentData {
  name?: string;
  description?: string;
  orderIndex?: number;
}

export interface DeliverContentData {
  studentId: string;
  contentId: string;
  method: string;
}

export interface StudentContentStatus {
  studentId: string;
  studentName: string;
  programId: string;
  programName: string;
  totalPayments: number;
  paymentsCount: number;
  availableContents: AcademicContent[];
  deliveredContents: ContentDelivery[];
  pendingContents: AcademicContent[];
}
