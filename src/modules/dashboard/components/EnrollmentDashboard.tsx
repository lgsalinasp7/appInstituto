"use client";

import { useState, useMemo } from "react";
import { TrendingUp, Users, Clock, CheckCircle2, Plus } from "lucide-react";

import { DashboardSidebar } from "./DashboardSidebar";
import { MobileHeader } from "./MobileHeader";
import { MobileSidebar } from "./MobileSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { StatCard } from "./StatCard";
import { RevenueChart } from "./RevenueChart";
import { AlertsList } from "./AlertsList";
import { StudentsTable } from "./StudentsTable";
import { ReportsView } from "./ReportsView";
import { PaymentModal } from "./PaymentModal";
import { PaymentsHistoryView } from "./PaymentsHistoryView";
import { CarteraView } from "./CarteraView";
import { ProspectsView } from "./ProspectsView";
import { StudentForm } from "@/modules/students/components/StudentForm";

import type { DashboardTab, Student, AlertItem, RevenueData } from "../types";
import { 
  DEMO_STUDENTS, 
  DEMO_DASHBOARD_STATS, 
  DEMO_REVENUE_CHART, 
  DEMO_CARTERA_ALERTS 
} from "../data/demo-data";

const MOCK_USER_ID = "user-demo-001";

export function EnrollmentDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const students: Student[] = DEMO_STUDENTS.map((s) => ({
    id: s.id,
    name: s.name,
    document: s.document,
    phone: s.phone,
    email: s.email,
    enrollmentDate: s.enrollmentDate,
    advisor: s.advisor,
    status: s.status as "active" | "inactive" | "transferred",
    program: s.program,
    totalValue: s.totalValue,
    paidAmount: s.paidAmount,
    remainingBalance: s.remainingBalance,
    nextPaymentDate: s.nextPaymentDate,
  }));

  const dashboardStats = {
    totalRevenue: `$${DEMO_DASHBOARD_STATS.totalRevenue.toLocaleString()}`,
    activeStudents: String(DEMO_DASHBOARD_STATS.activeStudents),
    pendingPayments: String(DEMO_DASHBOARD_STATS.pendingPayments),
    conversionRate: `${DEMO_DASHBOARD_STATS.conversionRate}%`,
  };

  const revenueData: RevenueData[] = DEMO_REVENUE_CHART;

  const alerts: AlertItem[] = DEMO_CARTERA_ALERTS.slice(0, 5).map((a) => ({
    name: a.studentName,
    amount: `$${a.amount.toLocaleString()}`,
    date: a.type === "overdue" ? `Hace ${a.daysOverdue} días` : a.type === "today" ? "Hoy" : new Date(a.dueDate).toLocaleDateString("es-CO"),
    type: a.type === "overdue" ? "overdue" : "pending",
  }));

  const advisorPerformance = [
    { name: "María González", sales: 8, collected: 4250000 },
    { name: "Carlos Rodríguez", sales: 6, collected: 3150000 },
    { name: "Ana Martínez", sales: 7, collected: 3800000 },
    { name: "Luis Hernández", sales: 4, collected: 2100000 },
  ];

  const programDistribution = [
    { name: "Técnico en Enfermería", value: 28 },
    { name: "Auxiliar en Salud Oral", value: 24 },
    { name: "Técnico en Farmacia", value: 20 },
    { name: "Auxiliar Administrativo", value: 16 },
    { name: "Atención Primera Infancia", value: 12 },
  ];

  const pendingDebts = DEMO_STUDENTS.filter(s => s.remainingBalance > 0).slice(0, 5).map(s => ({
    name: s.name,
    balance: s.remainingBalance,
    due: s.nextPaymentDate,
    advisor: s.advisor,
  }));

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.document.includes(searchTerm)
    );
  }, [searchTerm, students]);

  const handlePaymentClick = (student: Student) => {
    setSelectedStudent(student);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedStudent(null);
  };

  const handleStudentFormSuccess = () => {
    setShowStudentForm(false);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Panel de Control";
      case "enrollments":
        return "Matrículas";
      case "payments":
        return "Pagos & Recibos";
      case "cartera":
        return "Control de Cartera";
      case "prospects":
        return "Prospectos";
      case "reports":
        return "Reportes";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-[#1e293b]">
      <MobileHeader
        isMenuOpen={isMobileMenuOpen}
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 lg:ml-72 pt-20 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <DashboardHeader
            title={getTabTitle()}
            subtitle="Gestiona tu actividad educativa"
          />

          {activeTab === "dashboard" && (
            <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                <StatCard
                  title="Ingresos del Mes"
                  value={dashboardStats.totalRevenue}
                  icon={TrendingUp}
                  trend="up"
                  trendValue="+12.5%"
                  gradient="from-emerald-500 to-emerald-600"
                />
                <StatCard
                  title="Estudiantes Activos"
                  value={dashboardStats.activeStudents}
                  icon={Users}
                  trend="up"
                  trendValue="+4.2%"
                  gradient="from-[#1e3a5f] to-[#2d4a6f]"
                />
                <StatCard
                  title="Pagos Pendientes"
                  value={dashboardStats.pendingPayments}
                  icon={Clock}
                  trend="down"
                  trendValue="-2.1%"
                  gradient="from-orange-500 to-orange-600"
                />
                <StatCard
                  title="Tasa de Cierre"
                  value={dashboardStats.conversionRate}
                  icon={CheckCircle2}
                  trend="up"
                  trendValue="+5.4%"
                  gradient="from-purple-500 to-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                <div className="xl:col-span-2">
                  <RevenueChart data={revenueData} />
                </div>
                <AlertsList alerts={alerts} />
              </div>
            </div>
          )}

          {activeTab === "enrollments" && (
            <div className="animate-fade-in-up space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowStudentForm(true)}
                  className="px-4 py-2.5 bg-[#1e3a5f] text-white rounded-xl hover:bg-[#2d4a6f] transition-colors flex items-center gap-2 font-medium shadow-lg shadow-[#1e3a5f]/20"
                >
                  <Plus size={18} />
                  Nuevo Estudiante
                </button>
              </div>
              <StudentsTable
                students={filteredStudents}
                onPaymentClick={handlePaymentClick}
              />
            </div>
          )}

          {activeTab === "payments" && (
            <div className="animate-fade-in-up">
              <PaymentsHistoryView />
            </div>
          )}

          {activeTab === "cartera" && (
            <div className="animate-fade-in-up">
              <CarteraView />
            </div>
          )}

          {activeTab === "prospects" && (
            <div className="animate-fade-in-up">
              <ProspectsView currentUserId={MOCK_USER_ID} />
            </div>
          )}

          {activeTab === "reports" && (
            <div className="animate-fade-in-up">
              <ReportsView
                advisorPerformance={advisorPerformance}
                programDistribution={programDistribution}
                pendingDebts={pendingDebts}
              />
            </div>
          )}
        </div>
      </main>

      {selectedStudent && (
        <PaymentModal
          student={selectedStudent}
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedStudent(null);
          }}
          onSuccess={handlePaymentSuccess}
          currentUserId={MOCK_USER_ID}
        />
      )}

      <StudentForm
        isOpen={showStudentForm}
        onClose={() => setShowStudentForm(false)}
        onSuccess={handleStudentFormSuccess}
        currentUserId={MOCK_USER_ID}
      />
    </div>
  );
}
