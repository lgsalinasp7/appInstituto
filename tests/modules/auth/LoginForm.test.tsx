import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/modules/auth/components/LoginForm";
import { BrandingProvider } from "@/components/providers/BrandingContext";

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: any) => <img src={src} alt={alt} />,
}));

function renderLoginForm(props?: { onSubmit?: (data: any) => Promise<void> }) {
  return render(
    <BrandingProvider branding={{ tenantName: "Test Tenant", darkMode: false }}>
      <LoginForm {...props} />
    </BrandingProvider>
  );
}

describe("LoginForm", () => {
  it("renderiza el formulario con campos email y contraseña", () => {
    renderLoginForm();

    expect(screen.getByPlaceholderText(/tu@email\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ingresar al portal/i })).toBeInTheDocument();
  });

  it("muestra mensaje de bienvenida con nombre del tenant", () => {
    renderLoginForm();

    expect(screen.getByText(/bienvenido de nuevo/i)).toBeInTheDocument();
    expect(screen.getByText(/accede al portal de test tenant/i)).toBeInTheDocument();
  });

  it("muestra link de olvidé contraseña", () => {
    renderLoginForm();

    expect(screen.getByRole("link", { name: /olvidaste tu contraseña/i })).toBeInTheDocument();
  });

  it("llama onSubmit con datos válidos al enviar", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderLoginForm({ onSubmit });

    await user.type(screen.getByPlaceholderText(/tu@email\.com/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/••••••••/), "password123");
    await user.click(screen.getByRole("button", { name: /ingresar al portal/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("no llama onSubmit cuando los datos son inválidos", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderLoginForm({ onSubmit });

    await user.type(screen.getByPlaceholderText(/tu@email\.com/i), "invalid-email");
    await user.type(screen.getByPlaceholderText(/••••••••/), "123");
    await user.click(screen.getByRole("button", { name: /ingresar al portal/i }));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it("deshabilita el botón mientras carga", async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void;
    const onSubmit = vi.fn().mockImplementation(
      () => new Promise<void>((r) => { resolveSubmit = r; })
    );

    renderLoginForm({ onSubmit });

    await user.type(screen.getByPlaceholderText(/tu@email\.com/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/••••••••/), "password123");
    await user.click(screen.getByRole("button", { name: /ingresar al portal/i }));

    expect(screen.getByRole("button", { name: /verificando/i })).toBeDisabled();

    resolveSubmit!();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /ingresar al portal/i })).not.toBeDisabled();
    });
  });
});
