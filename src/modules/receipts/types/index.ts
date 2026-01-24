export interface ReceiptData {
  id: string;
  receiptNumber: string;
  generatedAt: Date;
  sentVia: string | null;
  sentAt: Date | null;
  pdfUrl: string | null;
  payment: {
    id: string;
    amount: number;
    paymentDate: Date;
    method: string;
    reference: string | null;
  };
  student: {
    id: string;
    fullName: string;
    documentType: string;
    documentNumber: string;
    phone: string;
    email: string | null;
    program: {
      name: string;
    };
  };
  registeredBy: {
    name: string | null;
    email: string;
  };
  balance: {
    totalProgramValue: number;
    totalPaid: number;
    remainingBalance: number;
  };
}

export interface SendReceiptOptions {
  via: "whatsapp" | "email";
  phoneNumber?: string;
  email?: string;
}
