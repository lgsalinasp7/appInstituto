/**
 * Helpers para llamadas a la API de KaledAcademy
 * Base: /api/academy
 */

const BASE = "/api/academy";

export async function fetchCourses() {
  const res = await fetch(BASE + "/courses");
  if (!res.ok) throw new Error("Error al cargar cursos");
  return res.json();
}

export async function fetchCourseSidebar(courseId: string) {
  const res = await fetch(`${BASE}/courses/${courseId}/sidebar`);
  if (!res.ok) throw new Error("Error al cargar sidebar");
  return res.json();
}

export async function fetchLesson(lessonId: string) {
  const res = await fetch(`${BASE}/lessons/${lessonId}`);
  if (!res.ok) {
    let message = "Error al cargar lección";
    try {
      const body = await res.json();
      if (typeof body?.error === "string") message = body.error;
    } catch {
      // usar mensaje por defecto
    }
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function fetchCohorts() {
  const res = await fetch(BASE + "/cohorts");
  if (!res.ok) throw new Error("Error al cargar cohortes");
  return res.json();
}

export async function fetchActiveCohort() {
  const res = await fetch(BASE + "/cohorts/active");
  if (!res.ok) throw new Error("Error al cargar cohorte activa");
  return res.json();
}

export async function fetchCohortRanking(cohortId: string) {
  const res = await fetch(`${BASE}/cohorts/${cohortId}/ranking`);
  if (!res.ok) throw new Error("Error al cargar ranking");
  return res.json();
}

export async function fetchCohortAnalytics(cohortId: string) {
  const res = await fetch(`${BASE}/cohorts/${cohortId}/analytics`);
  if (!res.ok) throw new Error("Error al cargar analytics");
  return res.json();
}

export async function fetchBadges() {
  const res = await fetch(BASE + "/badges");
  if (!res.ok) throw new Error("Error al cargar badges");
  return res.json();
}

export async function fetchProgress(courseId?: string) {
  const url = courseId ? `${BASE}/progress/${courseId}` : BASE + "/progress";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al cargar progreso");
  return res.json();
}
