import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withPlatformAdmin } from "@/lib/api-auth";
import { resolveKaledTenantId } from "@/lib/kaled-tenant";

export const GET = withPlatformAdmin(["SUPER_ADMIN"], async () => {
  const tenantId = await resolveKaledTenantId();
  const schedules = await prisma.softwareRevenueSchedule.findMany({
    where: { tenantId },
    orderBy: { periodStart: "desc" },
    include: {
      sale: {
        select: {
          id: true,
          customerName: true,
          productName: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: schedules.map((schedule) => ({
      id: schedule.id,
      softwareSaleId: schedule.softwareSaleId,
      saleLabel: `${schedule.sale.customerName} - ${schedule.sale.productName}`,
      mode: schedule.mode,
      periodStart: schedule.periodStart.toISOString(),
      periodEnd: schedule.periodEnd.toISOString(),
      recognizedAmountCop: Number(schedule.recognizedAmountCop),
    })),
  });
});

export const POST = withPlatformAdmin(["SUPER_ADMIN"], async (request: NextRequest) => {
  const body = await request.json();
  const tenantId = await resolveKaledTenantId();

  const softwareSaleId = String(body.softwareSaleId || "").trim();
  const periodStart = body.periodStart ? new Date(body.periodStart) : null;
  const periodEnd = body.periodEnd ? new Date(body.periodEnd) : null;
  const recognizedAmountCop = Number(body.recognizedAmountCop);

  if (!softwareSaleId || !periodStart || !periodEnd) {
    return NextResponse.json(
      { success: false, error: "softwareSaleId, periodStart y periodEnd son requeridos." },
      { status: 400 }
    );
  }

  if ([periodStart, periodEnd].some((d) => Number.isNaN(d.getTime()))) {
    return NextResponse.json(
      { success: false, error: "Las fechas del prorrateo no son válidas." },
      { status: 400 }
    );
  }

  if (periodEnd < periodStart) {
    return NextResponse.json(
      { success: false, error: "periodEnd no puede ser menor que periodStart." },
      { status: 400 }
    );
  }

  if (!Number.isFinite(recognizedAmountCop) || recognizedAmountCop <= 0) {
    return NextResponse.json(
      { success: false, error: "recognizedAmountCop debe ser mayor a 0." },
      { status: 400 }
    );
  }

  const sale = await prisma.softwareSale.findFirst({
    where: { id: softwareSaleId, tenantId },
    select: { id: true },
  });

  if (!sale) {
    return NextResponse.json(
      { success: false, error: "La venta SaaS no existe o no pertenece a KaledSoft." },
      { status: 404 }
    );
  }

  const schedule = await prisma.softwareRevenueSchedule.create({
    data: {
      softwareSaleId,
      tenantId,
      mode: "PRORATED",
      periodStart,
      periodEnd,
      recognizedAmountCop,
    },
  });

  return NextResponse.json({
    success: true,
    data: schedule,
  });
});

export const DELETE = withPlatformAdmin(["SUPER_ADMIN"], async (request: NextRequest) => {
  const scheduleId = String(request.nextUrl.searchParams.get("scheduleId") || "").trim();
  if (!scheduleId) {
    return NextResponse.json(
      { success: false, error: "scheduleId es requerido." },
      { status: 400 }
    );
  }

  const tenantId = await resolveKaledTenantId();
  const schedule = await prisma.softwareRevenueSchedule.findFirst({
    where: { id: scheduleId, tenantId },
    select: { id: true },
  });

  if (!schedule) {
    return NextResponse.json(
      { success: false, error: "El prorrateo no existe o no pertenece a KaledSoft." },
      { status: 404 }
    );
  }

  await prisma.softwareRevenueSchedule.delete({
    where: { id: scheduleId },
  });

  return NextResponse.json({ success: true });
});
