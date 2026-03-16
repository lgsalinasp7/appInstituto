import { NextRequest, NextResponse } from "next/server";
import { CohortCostCategory, CohortCostSourceType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { withPlatformAdmin } from "@/lib/api-auth";

async function resolveAcademyTenantId(): Promise<string> {
  const academyTenant = await prisma.tenant.findUnique({
    where: { slug: "kaledacademy" },
    select: { id: true },
  });

  if (!academyTenant) {
    throw new Error("Tenant kaledacademy no encontrado para costos de cohorte.");
  }

  return academyTenant.id;
}

export const GET = withPlatformAdmin(["SUPER_ADMIN"], async () => {
  const tenantId = await resolveAcademyTenantId();
  const allocations = await prisma.academyCohortCostAllocation.findMany({
    where: { tenantId },
    orderBy: { allocationDate: "desc" },
    include: {
      cohort: {
        select: {
          id: true,
          name: true,
          course: {
            select: { title: true },
          },
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: allocations.map((allocation) => ({
      id: allocation.id,
      cohortId: allocation.cohortId,
      cohortName: allocation.cohort.name,
      courseTitle: allocation.cohort.course.title,
      category: allocation.category,
      sourceType: allocation.sourceType,
      label: allocation.label,
      amountCop: Number(allocation.amountCop),
      allocationDate: allocation.allocationDate.toISOString(),
      monthIndex: allocation.monthIndex,
      notes: allocation.notes,
    })),
  });
});

export const POST = withPlatformAdmin(["SUPER_ADMIN"], async (request: NextRequest) => {
  const body = await request.json();
  const tenantId = await resolveAcademyTenantId();

  const cohortId = String(body.cohortId || "").trim();
  const rawCategory = String(body.category || "").trim();
  const rawSourceType = String(body.sourceType || "").trim() || "MANUAL";
  const allocationDate = body.allocationDate ? new Date(body.allocationDate) : null;
  const label = String(body.label || "").trim();
  const amountCop = Number(body.amountCop);
  const monthIndex =
    body.monthIndex === null || body.monthIndex === undefined || body.monthIndex === ""
      ? null
      : Number(body.monthIndex);

  const allowedCategories: CohortCostCategory[] = [
    "ADS",
    "INSTRUCTOR",
    "PLATFORM",
    "TOOLS",
    "OTHER",
  ];
  const allowedSourceTypes: CohortCostSourceType[] = ["MANUAL", "CAMPAIGN"];

  if (!cohortId || !rawCategory || !allocationDate || !label) {
    return NextResponse.json(
      { success: false, error: "cohortId, category, label y allocationDate son requeridos." },
      { status: 400 }
    );
  }

  if (Number.isNaN(allocationDate.getTime())) {
    return NextResponse.json(
      { success: false, error: "allocationDate no es una fecha válida." },
      { status: 400 }
    );
  }

  if (!allowedCategories.includes(rawCategory as CohortCostCategory)) {
    return NextResponse.json(
      { success: false, error: "category no es válida." },
      { status: 400 }
    );
  }

  if (!allowedSourceTypes.includes(rawSourceType as CohortCostSourceType)) {
    return NextResponse.json(
      { success: false, error: "sourceType no es válido." },
      { status: 400 }
    );
  }

  const category = rawCategory as CohortCostCategory;
  const sourceType = rawSourceType as CohortCostSourceType;

  if (!Number.isFinite(amountCop) || amountCop <= 0) {
    return NextResponse.json(
      { success: false, error: "amountCop debe ser mayor a 0." },
      { status: 400 }
    );
  }

  if (monthIndex !== null && (!Number.isInteger(monthIndex) || monthIndex < 1)) {
    return NextResponse.json(
      { success: false, error: "monthIndex debe ser entero mayor o igual a 1." },
      { status: 400 }
    );
  }

  const cohort = await prisma.academyCohort.findFirst({
    where: { id: cohortId, tenantId },
    select: { id: true },
  });

  if (!cohort) {
    return NextResponse.json(
      { success: false, error: "La cohorte no existe o no pertenece a kaledacademy." },
      { status: 404 }
    );
  }

  const allocation = await prisma.academyCohortCostAllocation.create({
    data: {
      tenantId,
      cohortId,
      category,
      sourceType,
      label,
      allocationDate,
      amountCop,
      monthIndex,
      notes: body.notes ? String(body.notes).trim() : null,
    },
  });

  return NextResponse.json({
    success: true,
    data: allocation,
  });
});

export const DELETE = withPlatformAdmin(["SUPER_ADMIN"], async (request: NextRequest) => {
  const allocationId = String(request.nextUrl.searchParams.get("allocationId") || "").trim();
  if (!allocationId) {
    return NextResponse.json(
      { success: false, error: "allocationId es requerido." },
      { status: 400 }
    );
  }

  const tenantId = await resolveAcademyTenantId();
  const allocation = await prisma.academyCohortCostAllocation.findFirst({
    where: { id: allocationId, tenantId },
    select: { id: true },
  });

  if (!allocation) {
    return NextResponse.json(
      { success: false, error: "El costo no existe o no pertenece a KaledAcademy." },
      { status: 404 }
    );
  }

  await prisma.academyCohortCostAllocation.delete({
    where: { id: allocationId },
  });

  return NextResponse.json({ success: true });
});
