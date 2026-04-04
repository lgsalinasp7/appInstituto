import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany({
    select: { id: true, slug: true, name: true },
  });
  console.log("=== TENANTS ===");
  for (const t of tenants) {
    console.log(`  ${t.slug} | ${t.name} | id: ${t.id}`);
  }

  console.log("\n=== COHORTES POR TENANT ===");
  const cohorts = await prisma.academyCohort.findMany({
    include: {
      course: { select: { title: true, tenantId: true } },
      _count: { select: { events: true, enrollments: true } },
    },
    orderBy: { startDate: "desc" },
  });
  for (const c of cohorts) {
    const t = tenants.find((x) => x.id === c.tenantId);
    console.log(
      `  tenant: ${t?.slug ?? "?"} | ${c.name} | curso: ${c.course.title} | eventos: ${c._count.events} | enrolls: ${c._count.enrollments} | status: ${c.status}`
    );
  }

  console.log("\n=== USERS CON ROLE ACADEMY ===");
  const users = await prisma.user.findMany({
    where: { platformRole: { startsWith: "ACADEMY" } },
    select: { id: true, name: true, email: true, platformRole: true, tenantId: true },
  });
  for (const u of users) {
    const t = tenants.find((x) => x.id === u.tenantId);
    console.log(
      `  ${u.email} | ${u.platformRole} | tenant: ${t?.slug ?? "?"}`
    );
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
