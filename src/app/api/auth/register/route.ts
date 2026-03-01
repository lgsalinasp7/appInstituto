import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthService } from "@/modules/auth/services/auth.service";
import { registerSchema } from "@/modules/auth/schemas";
import { checkRateLimit, RATE_LIMIT_CONFIGS, RateLimitError } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const tenantSlug = request.headers.get("x-tenant-slug");
    if (tenantSlug === "kaledacademy") {
      return NextResponse.json(
        {
          success: false,
          error: "El registro publico esta deshabilitado para Kaled Academy. Solicita invitacion al administrador.",
        },
        { status: 403 }
      );
    }

    // Aplicar rate limiting
    const rateLimit = checkRateLimit(request, RATE_LIMIT_CONFIGS.REGISTER, "register");
    
    if (!rateLimit.allowed) {
      const resetIn = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { 
          success: false, 
          error: `Demasiados intentos de registro. Por favor, intente nuevamente en ${resetIn} segundos.` 
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT_CONFIGS.REGISTER.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.resetAt.toString(),
            "Retry-After": Math.ceil(resetIn).toString(),
          }
        }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = registerSchema.safeParse({
      ...body,
      confirmPassword: body.password, // Schema expects confirmPassword
    });

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Este correo electrónico ya está registrado" },
        { status: 409 }
      );
    }

    // Find default role (ESTUDIANTE)
    let role = await prisma.role.findFirst({
      where: { name: "ESTUDIANTE" },
    });

    if (!role) {
      // Fallback to STUDENT
      role = await prisma.role.findFirst({
        where: { name: "STUDENT" },
      });
    }

    if (!role) {
      // Fallback to USER if STUDENT not found
      role = await prisma.role.findFirst({
        where: { name: "USER" },
      });
    }

    // Last resort callback
    if (!role) {
      console.error("No default role found (ESTUDIANTE/STUDENT/USER)");
      return NextResponse.json(
        { success: false, error: "Error de configuración: Rol de estudiante no encontrado" },
        { status: 500 }
      );
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: role.id,
        isActive: true, // Auto-activate or require email verification? Plan says "Verificación de email: No existe" so active true.
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: newUser,
      message: "Cuenta creada exitosamente"
    });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
