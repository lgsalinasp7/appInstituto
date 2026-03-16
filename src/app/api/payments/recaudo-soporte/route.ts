import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { withTenantAuth } from "@/lib/api-auth";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const POST = withTenantAuth(async (request: NextRequest, _user, tenantId) => {
  try {
    const formData = await request.formData();
    const file = formData.get("soporte") as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No se envió ningún archivo" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Formato no permitido. Usa JPG, PNG, WebP o PDF (máx. 5 MB).",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          error: "El archivo es demasiado grande. Máximo 5 MB.",
        },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "pdf"].includes(ext)
      ? ext
      : "jpg";

    const blob = await put(
      `recaudo-soporte/${tenantId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`,
      file,
      {
        access: "public",
        addRandomSuffix: true,
      }
    );

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error("Error al subir soporte de recaudo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
});
