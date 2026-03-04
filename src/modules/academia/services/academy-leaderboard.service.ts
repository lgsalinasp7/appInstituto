/**
 * Servicio de Leaderboard para Academia LMS
 * Calcula ranking basado en lecciones completadas por usuario del mismo tenant.
 * 1 punto = 1 lección completada. Sin migración de BD.
 */
import { prisma } from "@/lib/prisma";
import type { LeaderboardEntry, LeaderboardResponse } from "../types";

export class AcademyLeaderboardService {
  static async getLeaderboard(tenantId: string, currentUserId: string): Promise<LeaderboardResponse> {
    // Obtener todos los usuarios de academia del tenant
    const tenantUsers = await prisma.user.findMany({
      where: {
        tenantId,
        platformRole: { in: ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"] },
        isActive: true,
      },
      select: { id: true, name: true, image: true, platformRole: true },
    });

    if (tenantUsers.length === 0) {
      return { entries: [], currentUserEntry: null };
    }

    const userIds = tenantUsers.map((u) => u.id);

    // Contar lecciones completadas por usuario
    const progressCounts = await prisma.academyStudentProgress.groupBy({
      by: ["userId"],
      where: {
        userId: { in: userIds },
        completed: true,
      },
      _count: { lessonId: true },
    });

    const countMap = new Map<string, number>(
      progressCounts.map((p) => [p.userId, p._count.lessonId])
    );

    // Construir entries con puntos
    const entries: LeaderboardEntry[] = tenantUsers
      .map((user) => ({
        userId: user.id,
        name: user.name ?? "Estudiante",
        image: user.image ?? null,
        role: user.platformRole ?? "ACADEMY_STUDENT",
        points: countMap.get(user.id) ?? 0,
        rank: 0,
      }))
      .sort((a, b) => b.points - a.points)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    const currentUserEntry = entries.find((e) => e.userId === currentUserId) ?? null;

    return { entries, currentUserEntry };
  }
}
