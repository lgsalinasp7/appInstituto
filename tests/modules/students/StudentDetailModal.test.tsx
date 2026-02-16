/**
 * StudentDetailModal component tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StudentDetailModal } from "@/modules/students/components/StudentDetailModal";
import { BrandingProvider } from "@/components/providers/BrandingContext";

const mockStudent = {
  id: "s1",
  fullName: "Juan Pérez",
  documentType: "CC",
  documentNumber: "123456789",
  phone: "3001234567",
  email: "juan@test.com",
  address: "Calle 123",
  status: "MATRICULADO",
  program: { name: "Ingeniería" },
  advisor: { name: "María López", email: "maria@test.com" },
  enrollmentDate: "2025-01-15",
  totalProgramValue: 5000000,
  totalPaid: 2000000,
  remainingBalance: 3000000,
};

const mockPayments = [
  {
    id: "p1",
    amount: 1000000,
    paymentDate: "2025-01-20",
    method: "BANCOLOMBIA",
    reference: "REF-001",
    receiptNumber: "REC-001",
    registeredBy: { name: "Admin", email: "admin@test.com" },
  },
];

function renderModal(props: {
  studentId?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onPaymentClick?: () => void;
} = {}) {
  const defaultProps = {
    studentId: "s1",
    isOpen: true,
    onClose: vi.fn(),
    onPaymentClick: vi.fn(),
  };
  return render(
    <BrandingProvider branding={{ tenantName: "Test", darkMode: false }}>
      <StudentDetailModal {...defaultProps} {...props} />
    </BrandingProvider>
  );
}

describe("StudentDetailModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("no renderiza cuando isOpen es false", () => {
    renderModal({ isOpen: false });

    expect(screen.queryByText("Juan Pérez")).not.toBeInTheDocument();
  });

  it("muestra loading inicial", () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ json: () => Promise.resolve({ success: false }) } as Response)
      .mockResolvedValueOnce({ json: () => Promise.resolve({ success: false }) } as Response);

    renderModal();

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renderiza datos del estudiante tras cargar", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: mockStudent }),
      } as Response)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: { payments: mockPayments } }),
      } as Response);

    renderModal();

    await waitFor(() => {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    });

    expect(screen.getByText(/CC: 123456789/)).toBeInTheDocument();
    expect(screen.getAllByText("Ingeniería").length).toBeGreaterThan(0);
    expect(screen.getByText("MATRICULADO")).toBeInTheDocument();
  });

  it("llama onClose al hacer clic en el botón cerrar", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: mockStudent }),
      } as Response)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: { payments: [] } }),
      } as Response);

    const onClose = vi.fn();
    renderModal({ onClose });

    await waitFor(() => {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole("button");
    const closeBtn = buttons[0]; // Close (X) is first
    await userEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it("llama onPaymentClick al hacer clic en Registrar Pago", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: mockStudent }),
      } as Response)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: { payments: [] } }),
      } as Response);

    const onPaymentClick = vi.fn();
    renderModal({ onPaymentClick });

    await waitFor(() => {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /registrar pago/i }));

    expect(onPaymentClick).toHaveBeenCalled();
  });
});
