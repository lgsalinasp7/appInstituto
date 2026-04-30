import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put, del } from "@vercel/blob";
import { logApiStart, logApiSuccess, logApiError } from "@/lib/api-logger";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  const ctx = logApiStart(request, "auth_avatar_upload");
  const startedAt = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Usa JPG, PNG o WebP." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. Máximo 2 MB." },
        { status: 400 },
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { image: true },
    });

    if (dbUser?.image && dbUser.image.includes("vercel-storage.com")) {
      try {
        await del(dbUser.image);
      } catch {
        // old blob already deleted or invalid — continue
      }
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const blob = await put(`avatars/${user.id}.${ext}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { image: blob.url },
    });

    logApiSuccess(ctx, "auth_avatar_upload", {
      duration: Date.now() - startedAt,
      resultId: user.id,
    });
    return NextResponse.json({ success: true, imageUrl: blob.url });
  } catch (error) {
    logApiError(ctx, "auth_avatar_upload", { error });
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
