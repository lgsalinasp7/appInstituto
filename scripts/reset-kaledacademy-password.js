const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  const prisma = new PrismaClient();
  const email = "luisg@kaledsoft.tech";
  const temporaryPassword = "KaledReset2026!";

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: "kaledacademy" },
      select: { id: true },
    });

    if (!tenant) {
      throw new Error("Tenant kaledacademy no encontrado.");
    }

    const hash = await bcrypt.hash(temporaryPassword, 12);

    const updated = await prisma.user.updateMany({
      where: {
        tenantId: tenant.id,
        email: { equals: email, mode: "insensitive" },
      },
      data: {
        password: hash,
        mustChangePassword: true,
      },
    });

    const user = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        email: { equals: email, mode: "insensitive" },
      },
      select: {
        email: true,
        isActive: true,
        platformRole: true,
        mustChangePassword: true,
        password: true,
      },
    });

    const passwordMatch = user?.password
      ? await bcrypt.compare(temporaryPassword, user.password)
      : false;

    console.log(
      JSON.stringify(
        {
          updated: updated.count,
          email: user?.email ?? null,
          isActive: user?.isActive ?? null,
          platformRole: user?.platformRole ?? null,
          mustChangePassword: user?.mustChangePassword ?? null,
          passwordHashLength: user?.password?.length ?? 0,
          passwordMatch,
        },
        null,
        2
      )
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
