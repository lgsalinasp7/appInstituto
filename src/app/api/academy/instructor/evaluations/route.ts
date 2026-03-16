import { NextRequest, NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { INSTRUCTOR_ROLES } from "@/modules/academy/config/roles";
import { prisma } from "@/lib/prisma";

async function GET_handler(
  _req: NextRequest,
  _user: { id: string },
  tenantId: string
) {
  const evaluations = await prisma.kaledDeliverableEvaluation.findMany({
    where: { tenantId, status: "PENDING_APPROVAL" },
    orderBy: { createdAt: "desc" },
  });

  const withDetails = await Promise.all(
    evaluations.map(async (e) => {
      const submission = await prisma.academyDeliverableSubmission.findUnique({
        where: { id: e.submissionId },
        include: {
          user: { select: { name: true, email: true } },
          deliverable: {
            include: {
              lesson: { select: { title: true } },
            },
          },
        },
      });
      return {
        ...e,
        studentName: submission?.user?.name ?? submission?.user?.email ?? "Estudiante",
        deliverableTitle: submission?.deliverable?.title ?? "",
        lessonTitle: submission?.deliverable?.lesson?.title ?? "",
      };
    })
  );

  return NextResponse.json(withDetails);
}

export const GET = withAcademyAuth(INSTRUCTOR_ROLES, GET_handler);
