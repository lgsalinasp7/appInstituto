import { NextRequest, NextResponse } from "next/server";
import { FinancePaymentStatus, SoftwareSaleStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { withPlatformAdmin } from "@/lib/api-auth";
import { resolveKaledTenantId } from "@/lib/kaled-tenant";
import { FinanceService } from "@/modules/finance";

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export const GET = withPlatformAdmin(["SUPER_ADMIN"], async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const startDate = parseDate(searchParams.get("startDate"));
  const endDate = parseDate(searchParams.get("endDate"));
  const kaledTenantId = await resolveKaledTenantId();

  const data = await FinanceService.getSaasRevenue(kaledTenantId, { startDate, endDate });

  return NextResponse.json({
    success: true,
    data,
  });
});

export const POST = withPlatformAdmin(["SUPER_ADMIN"], async (request: NextRequest) => {
  const body = await request.json();
  const tenantId = await resolveKaledTenantId();

  const customerName = String(body.customerName || "").trim();
  const productName = String(body.productName || "").trim();
  const planName = body.planName ? String(body.planName).trim() : null;
  const saleDate = body.saleDate ? new Date(body.saleDate) : null;
  const contractStartDate = body.contractStartDate ? new Date(body.contractStartDate) : null;
  const contractEndDate = body.contractEndDate ? new Date(body.contractEndDate) : null;
  const amountCop = Number(body.amountCop);
  const collectedAmountCop = Number(body.collectedAmountCop ?? 0);
  const rawStatus = String(body.status || "CLOSED_WON").trim();
  const rawPaymentStatus = String(
    body.paymentStatus || (collectedAmountCop >= amountCop ? "PAID" : "PARTIAL")
  ).trim();

  const allowedStatuses: SoftwareSaleStatus[] = ["PENDING", "CLOSED_WON", "CANCELLED"];
  const allowedPaymentStatuses: FinancePaymentStatus[] = [
    "PENDING",
    "PARTIAL",
    "PAID",
    "REFUNDED",
    "WRITTEN_OFF",
  ];

  if (!customerName || !productName || !saleDate || !contractStartDate || !contractEndDate) {
    return NextResponse.json(
      { success: false, error: "customerName, productName, saleDate, contractStartDate y contractEndDate son requeridos." },
      { status: 400 }
    );
  }

  if ([saleDate, contractStartDate, contractEndDate].some((d) => Number.isNaN(d.getTime()))) {
    return NextResponse.json(
      { success: false, error: "Las fechas enviadas no son válidas." },
      { status: 400 }
    );
  }

  if (contractEndDate < contractStartDate) {
    return NextResponse.json(
      { success: false, error: "contractEndDate no puede ser menor que contractStartDate." },
      { status: 400 }
    );
  }

  if (!Number.isFinite(amountCop) || amountCop <= 0) {
    return NextResponse.json(
      { success: false, error: "amountCop debe ser mayor a 0." },
      { status: 400 }
    );
  }

  if (!Number.isFinite(collectedAmountCop) || collectedAmountCop < 0) {
    return NextResponse.json(
      { success: false, error: "collectedAmountCop no puede ser negativo." },
      { status: 400 }
    );
  }

  if (!allowedStatuses.includes(rawStatus as SoftwareSaleStatus)) {
    return NextResponse.json(
      { success: false, error: "status no es válido." },
      { status: 400 }
    );
  }

  if (!allowedPaymentStatuses.includes(rawPaymentStatus as FinancePaymentStatus)) {
    return NextResponse.json(
      { success: false, error: "paymentStatus no es válido." },
      { status: 400 }
    );
  }

  const status = rawStatus as SoftwareSaleStatus;
  const paymentStatus = rawPaymentStatus as FinancePaymentStatus;

  const sale = await prisma.softwareSale.create({
    data: {
      tenantId,
      customerName,
      productName,
      planName,
      saleDate,
      contractStartDate,
      contractEndDate,
      amountCop,
      collectedAmountCop,
      status,
      paymentStatus,
      notes: body.notes ? String(body.notes) : null,
    },
  });

  return NextResponse.json({
    success: true,
    data: sale,
  });
});

export const DELETE = withPlatformAdmin(["SUPER_ADMIN"], async (request: NextRequest) => {
  const saleId = String(request.nextUrl.searchParams.get("saleId") || "").trim();
  if (!saleId) {
    return NextResponse.json(
      { success: false, error: "saleId es requerido." },
      { status: 400 }
    );
  }

  const tenantId = await resolveKaledTenantId();
  const sale = await prisma.softwareSale.findFirst({
    where: { id: saleId, tenantId },
    select: { id: true },
  });

  if (!sale) {
    return NextResponse.json(
      { success: false, error: "La venta no existe o no pertenece a KaledSoft." },
      { status: 404 }
    );
  }

  await prisma.softwareSale.delete({
    where: { id: saleId },
  });

  return NextResponse.json({
    success: true,
  });
});
