import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const searchParams = request.nextUrl.searchParams;
  const role = searchParams.get("role");
  const search = searchParams.get("search");
  const showSuperAdmin = searchParams.get("showSuperAdmin") === "true";

  const where: any = {
    isActive: true,
    tenantId, // Filtrar por tenant
  };

  // Exclude SUPERADMIN by default
  if (!showSuperAdmin) {
    where.role = {
      name: { not: "SUPERADMIN" },
    };
  }

  if (role === "advisor") {
    where.role = {
      name: { in: ["ADMINISTRADOR", "VENTAS"] },
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      isActive: true,
      invitationLimit: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // If SuperAdmin is requesting, fetch inviter info from invitations
  let usersWithInviter = users;
  if (showSuperAdmin) {
    const invitations = await prisma.invitation.findMany({
      where: { 
        status: "ACCEPTED",
        tenantId, // Solo invitaciones del tenant
      },
      select: {
        email: true,
        inviter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Map inviter info to users
    usersWithInviter = users.map((u) => {
      const invitation = invitations.find((i) => i.email === u.email);
      return {
        ...u,
        invitedBy: invitation?.inviter || null,
      };
    });
  }

  return NextResponse.json({
    success: true,
    data: { users: usersWithInviter },
  });
});
