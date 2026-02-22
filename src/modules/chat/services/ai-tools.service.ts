/**
 * AiToolsService - Herramientas que el agente IA puede invocar
 */

import { StudentService } from "@/modules/students/services/student.service";
import { ProgramService } from "@/modules/programs/services/program.service";
import { ReportsService } from "@/modules/reports/services/reports.service";
import { CarteraService } from "@/modules/cartera/services/cartera.service";
import prisma from "@/lib/prisma";
import type {
  GetStudentStatsInput,
  GetProgramInfoInput,
  GetCarteraReportInput,
  SearchStudentsInput,
} from "../types";

export class AiToolsService {
  /**
   * Obtiene estadísticas de estudiantes y recaudos
   */
  static async getStudentStats(input: GetStudentStatsInput, tenantId: string) {
    const stats = await ReportsService.getDashboardStats();

    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(amount);

    return {
      resumen: `📊 Estadísticas del sistema KaledSoft`,
      estudiantes: {
        total: stats.activeStudents,
        activos: stats.activeStudents,
        nuevosEsteMes: stats.studentsChange,
      },
      recaudos: {
        hoy: formatCurrency(stats.todayRevenue),
        esteMes: formatCurrency(stats.monthlyRevenue),
        mesAnterior: formatCurrency(stats.monthlyRevenue / (1 + stats.revenueChange / 100) || 0),
      },
      cartera: {
        totalEnMora: formatCurrency(stats.overdueAmount),
        compromisosPendientes: stats.pendingPaymentsCount,
        proximosVencimientos: stats.pendingPaymentsCount,
      },
      tendencia: {
        crecimientoMensual: `${stats.revenueChange > 0 ? "+" : ""}${stats.revenueChange.toFixed(1)}%`,
        descripcion:
          stats.revenueChange > 0
            ? "El recaudo está creciendo respecto al mes anterior"
            : "El recaudo disminuyó respecto al mes anterior",
      },
    };
  }

  /**
   * Obtiene información de programas académicos
   */
  static async getProgramInfo(input: GetProgramInfoInput, tenantId: string) {
    if (input.programId) {
      // Obtener programa específico
      const program = await ProgramService.getProgramById(input.programId);
      if (!program) {
        return { error: "Programa no encontrado" };
      }

      const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
        }).format(amount);

      return {
        programa: {
          nombre: program.name,
          descripcion: program.description,
          valorTotal: formatCurrency(Number(program.totalValue)),
          valorMatricula: formatCurrency(Number(program.matriculaValue)),
          numeroModulos: program.modulesCount,
          estado: program.isActive ? "Activo" : "Inactivo",
        },
      };
    } else {
      // Listar todos los programas
      const programs = await ProgramService.getPrograms(true);

      const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
        }).format(amount);

      return {
        totalProgramas: programs.total,
        programas: programs.programs.map((p) => ({
          id: p.id,
          nombre: p.name,
          valorTotal: formatCurrency(Number(p.totalValue)),
          modulos: p.modulesCount,
          estado: p.isActive ? "Activo" : "Inactivo",
        })),
      };
    }
  }

  /**
   * Obtiene reportes de cartera
   */
  static async getCarteraReport(input: GetCarteraReportInput, tenantId: string) {
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(amount);

    const formatDate = (date: Date) =>
      new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(date));

    if (input.type === "summary") {
      const summary = await CarteraService.getSummary();

      return {
        tipo: "Resumen de Cartera",
        totalCompromisos: summary.overdueCount + summary.todayCount + summary.upcomingCount,
        totalPendiente: formatCurrency(summary.totalPendingAmount),
        vencidos: {
          cantidad: summary.overdueCount,
          monto: formatCurrency(summary.overdueAmount),
        },
        vencidosHoy: {
          cantidad: summary.todayCount,
          monto: formatCurrency(summary.todayAmount),
        },
        proximos: {
          cantidad: summary.upcomingCount,
          monto: formatCurrency(summary.upcomingAmount),
        },
      };
    } else if (input.type === "aging") {
      const aging = await ReportsService.getPortfolioAging();

      return {
        tipo: "Reporte de Antigüedad de Cartera",
        totalEnMora: formatCurrency(aging.totalOverdue),
        porRangos: aging.brackets.map((bracket) => ({
          rango: bracket.label,
          cantidad: bracket.count,
          monto: formatCurrency(bracket.amount),
        })),
      };
    } else if (input.type === "alerts") {
      const alerts = await CarteraService.getAlerts();

      return {
        tipo: "Alertas de Cartera",
        totalAlertas: alerts.length,
        alertas: alerts.slice(0, 10).map((alert) => ({
          tipo:
            alert.type === "overdue"
              ? "Vencido"
              : alert.type === "today"
              ? "Vence hoy"
              : "Próximo",
          estudiante: alert.studentName,
          fecha: formatDate(alert.dueDate),
          monto: formatCurrency(alert.amount),
          diasVencido: alert.daysOverdue ?? 0,
        })),
      };
    }

    return { error: "Tipo de reporte no válido" };
  }

  /**
   * Busca estudiantes por nombre o documento
   */
  static async searchStudents(input: SearchStudentsInput, tenantId: string) {
    const result = await StudentService.getStudents({
      search: input.query,
      page: 1,
      limit: input.limit || 10,
    });

    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(amount);

    return {
      totalEncontrados: result.total,
      estudiantes: result.students.map((s) => ({
        nombre: s.fullName,
        documento: `${s.documentType} ${s.documentNumber}`,
        programa: s.program.name,
        asesor: s.advisor.name,
        estado: s.status,
        saldoPendiente: formatCurrency(s.remainingBalance),
        telefono: s.phone,
        email: s.email || "No registrado",
      })),
    };
  }

  /**
   * Obtiene reportes de rendimiento de asesores
   */
  static async getAdvisorPerformance(tenantId: string) {
    const advisors = await ReportsService.getAdvisorReports("month");

    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(amount);

    return {
      totalAsesores: advisors.length,
      asesores: advisors.map((a) => ({
        nombre: a.advisorName,
        email: a.advisorEmail,
        totalEstudiantes: a.totalStudents,
        estudiantesActivos: a.activeStudents,
        totalVentas: formatCurrency(a.totalSales),
        totalRecaudado: formatCurrency(a.totalCollected),
        montoPendiente: formatCurrency(a.pendingAmount),
        tasaRecuperacion: `${a.collectionRate.toFixed(1)}%`,
        estudiantesEsteMes: a.studentsThisMonth,
        recaudoEsteMes: formatCurrency(a.revenueThisMonth),
      })),
    };
  }

  /**
   * Obtiene información del usuario actual
   */
  static async getCurrentUserInfo(userId: string, tenantId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          select: {
            name: true,
            permissions: true,
          },
        },
        tenant: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      return { error: "Usuario no encontrado" };
    }

    return {
      usuario: {
        nombre: user.name || "Usuario",
        email: user.email,
        rol: user.role?.name || "Sin rol",
        institucion: user.tenant?.name || "Sin institución",
      },
    };
  }
}
