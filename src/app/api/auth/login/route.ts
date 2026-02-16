import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/modules/auth/services/auth.service";
import { loginSchema } from "@/modules/auth/schemas";
import { createSession } from "@/lib/auth";
import { checkRateLimitByEmail, resetRateLimitByEmail, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar request body
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Aplicar rate limiting por email
    const rateLimit = checkRateLimitByEmail(email, RATE_LIMIT_CONFIGS.LOGIN, "login");

    if (!rateLimit.allowed) {
      const resetIn = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Demasiados intentos de inicio de sesion. Por favor, intente nuevamente en ${resetIn} segundos.`,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT_CONFIGS.LOGIN.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.resetAt.toString(),
            "Retry-After": Math.ceil(resetIn).toString(),
          },
        }
      );
    }

    const user = await AuthService.findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Credenciales invalidas" },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { success: false, error: "Cuenta sin contrasena configurada" },
        { status: 401 }
      );
    }

    const isValidPassword = await AuthService.verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Credenciales invalidas" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: "Cuenta inactiva" },
        { status: 403 }
      );
    }

    // Crear sesion (establece cookie httpOnly)
    await createSession(user.id);

    // Reiniciar rate limit tras login exitoso
    resetRateLimitByEmail(email, "login");

    const authUser = AuthService.mapToAuthUser(user);

    return NextResponse.json({
      success: true,
      data: {
        id: authUser?.id,
        email: authUser?.email,
        name: authUser?.name,
        role: authUser?.role?.name ?? null,
      },
      message: "Inicio de sesion exitoso",
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
