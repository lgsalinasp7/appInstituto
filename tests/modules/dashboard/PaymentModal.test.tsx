/**
 * PaymentModal component tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentModal } from "@/modules/dashboard/components/PaymentModal";
import { BrandingProvider } from "@/components/providers/BrandingContext";

vi.mock("@/modules/dashboard/utils/whatsapp", () => ({
  sendReceiptViaWhatsApp: vi.fn(),
}));

const mockStudent = {
  id: "s1",
  fullName: "María García",
  phone: "3001234567",
  document: "123456789",
  program: "Ingeniería",
  remainingBalance: 3000000,
  totalProgramValue: 5000000,
  totalPaid: 2000000,
};

function renderPaymentModal(props: {
  student?: typeof mockStudent;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
} = {}) {
  const defaultProps = {
    student: mockStudent,
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    currentUserId: "u1",
  };
  return render(
    <BrandingProvider branding={{ tenantName: "Test", darkMode: false }}>
      <PaymentModal {...defaultProps} {...props} />
    </BrandingProvider>
  );
}

describe("PaymentModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("no renderiza cuando isOpen es false", () => {
    renderPaymentModal({ isOpen: false });

    expect(screen.queryByText("Registrar Nuevo Pago")).not.toBeInTheDocument();
  });

  it("renderiza formulario con nombre del estudiante y saldo", () => {
    renderPaymentModal();

    expect(screen.getByText("Registrar Nuevo Pago")).toBeInTheDocument();
    expect(screen.getByText(/María García/)).toBeInTheDocument();
    expect(screen.getByText(/\$3\.000\.000/)).toBeInTheDocument();
  });

  it("muestra campos monto, método, referencia y comentarios", () => {
    renderPaymentModal();

    expect(screen.getByPlaceholderText("0")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ej: REF-123456")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Notas adicionales del pago...")).toBeInTheDocument();
  });

  it("llama onClose al hacer clic en Cancelar", async () => {
    const onClose = vi.fn();
    renderPaymentModal({ onClose });

    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it("muestra error de validación con monto inválido", async () => {
    renderPaymentModal();

    const amountInput = screen.getByPlaceholderText("0");
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, "0");
    await userEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    await waitFor(() => {
      expect(screen.getByText(/monto debe ser mayor a 0/i)).toBeInTheDocument();
    });
  });

  it("envía pago correctamente y muestra pantalla de éxito", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            payment: { receiptNumber: "REC-2025-001" },
            studentBalance: { remainingBalance: 2500000 },
          },
        }),
    } as Response);

    renderPaymentModal();

    await userEvent.type(screen.getByPlaceholderText("0"), "500000");
    await userEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    await waitFor(() => {
      expect(screen.getByText("Pago Registrado")).toBeInTheDocument();
    });

    expect(screen.getByText("REC-2025-001")).toBeInTheDocument();
    expect(screen.getByText(/\$2\.500\.000/)).toBeInTheDocument();
  });
});
