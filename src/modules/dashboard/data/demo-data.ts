export const DEMO_PROGRAMS = [
  { id: "prog-001", name: "Técnico en Enfermería", totalValue: 3500000, duration: "18 meses" },
  { id: "prog-002", name: "Auxiliar en Salud Oral", totalValue: 2800000, duration: "12 meses" },
  { id: "prog-003", name: "Técnico en Farmacia", totalValue: 3200000, duration: "18 meses" },
  { id: "prog-004", name: "Auxiliar Administrativo en Salud", totalValue: 2500000, duration: "12 meses" },
  { id: "prog-005", name: "Técnico en Atención a la Primera Infancia", totalValue: 2900000, duration: "18 meses" },
];

export const DEMO_ADVISORS = [
  { id: "adv-001", name: "María González", email: "maria.gonzalez@instituto.edu.co" },
  { id: "adv-002", name: "Carlos Rodríguez", email: "carlos.rodriguez@instituto.edu.co" },
  { id: "adv-003", name: "Ana Martínez", email: "ana.martinez@instituto.edu.co" },
  { id: "adv-004", name: "Luis Hernández", email: "luis.hernandez@instituto.edu.co" },
];

export const DEMO_STUDENTS = [
  { id: "std-001", name: "Laura Sofía Pérez Gómez", document: "1098765432", phone: "3023315972", email: "laura.perez@email.com", program: "Técnico en Enfermería", advisor: "María González", status: "MATRICULADO", totalValue: 3500000, paidAmount: 2100000, remainingBalance: 1400000, enrollmentDate: "2024-08-15", nextPaymentDate: "2025-01-25" },
  { id: "std-002", name: "Juan David López Torres", document: "1087654321", phone: "3023315972", email: "juan.lopez@email.com", program: "Auxiliar en Salud Oral", advisor: "Carlos Rodríguez", status: "MATRICULADO", totalValue: 2800000, paidAmount: 1400000, remainingBalance: 1400000, enrollmentDate: "2024-09-01", nextPaymentDate: "2025-01-28" },
  { id: "std-003", name: "Valentina Ramírez Díaz", document: "1076543210", phone: "3023315972", email: "valentina.ramirez@email.com", program: "Técnico en Farmacia", advisor: "Ana Martínez", status: "MATRICULADO", totalValue: 3200000, paidAmount: 800000, remainingBalance: 2400000, enrollmentDate: "2024-10-10", nextPaymentDate: "2025-01-22" },
  { id: "std-004", name: "Santiago Moreno Castro", document: "1065432109", phone: "3034567890", email: "santiago.moreno@email.com", program: "Auxiliar Administrativo en Salud", advisor: "Luis Hernández", status: "MATRICULADO", totalValue: 2500000, paidAmount: 2500000, remainingBalance: 0, enrollmentDate: "2024-07-20", nextPaymentDate: "-" },
  { id: "std-005", name: "Camila Andrea García Ruiz", document: "1054321098", phone: "3045678901", email: "camila.garcia@email.com", program: "Técnico en Atención a la Primera Infancia", advisor: "María González", status: "MATRICULADO", totalValue: 2900000, paidAmount: 1450000, remainingBalance: 1450000, enrollmentDate: "2024-08-25", nextPaymentDate: "2025-01-30" },
  { id: "std-006", name: "Andrés Felipe Martínez Vargas", document: "1043210987", phone: "3056789012", email: "andres.martinez@email.com", program: "Técnico en Enfermería", advisor: "Carlos Rodríguez", status: "MATRICULADO", totalValue: 3500000, paidAmount: 1750000, remainingBalance: 1750000, enrollmentDate: "2024-09-15", nextPaymentDate: "2025-02-01" },
  { id: "std-007", name: "Isabella Hernández Muñoz", document: "1032109876", phone: "3067890123", email: "isabella.hernandez@email.com", program: "Auxiliar en Salud Oral", advisor: "Ana Martínez", status: "MATRICULADO", totalValue: 2800000, paidAmount: 2100000, remainingBalance: 700000, enrollmentDate: "2024-06-10", nextPaymentDate: "2025-01-20" },
  { id: "std-008", name: "Mateo Alejandro Sánchez Ospina", document: "1021098765", phone: "3078901234", email: "mateo.sanchez@email.com", program: "Técnico en Farmacia", advisor: "Luis Hernández", status: "MATRICULADO", totalValue: 3200000, paidAmount: 1600000, remainingBalance: 1600000, enrollmentDate: "2024-08-01", nextPaymentDate: "2025-01-26" },
  { id: "std-009", name: "Sofía Valentina Torres Ríos", document: "1010987654", phone: "3089012345", email: "sofia.torres@email.com", program: "Auxiliar Administrativo en Salud", advisor: "María González", status: "MATRICULADO", totalValue: 2500000, paidAmount: 625000, remainingBalance: 1875000, enrollmentDate: "2024-11-01", nextPaymentDate: "2025-01-24" },
  { id: "std-010", name: "Daniel Esteban Rojas Mejía", document: "1009876543", phone: "3090123456", email: "daniel.rojas@email.com", program: "Técnico en Atención a la Primera Infancia", advisor: "Carlos Rodríguez", status: "MATRICULADO", totalValue: 2900000, paidAmount: 2175000, remainingBalance: 725000, enrollmentDate: "2024-05-15", nextPaymentDate: "2025-02-05" },
  { id: "std-011", name: "María José Gómez Londoño", document: "1098765431", phone: "3101234567", email: "maria.gomez@email.com", program: "Técnico en Enfermería", advisor: "Ana Martínez", status: "MATRICULADO", totalValue: 3500000, paidAmount: 875000, remainingBalance: 2625000, enrollmentDate: "2024-10-20", nextPaymentDate: "2025-01-18" },
  { id: "std-012", name: "Samuel David Jiménez Parra", document: "1087654320", phone: "3112345678", email: "samuel.jimenez@email.com", program: "Auxiliar en Salud Oral", advisor: "Luis Hernández", status: "MATRICULADO", totalValue: 2800000, paidAmount: 1960000, remainingBalance: 840000, enrollmentDate: "2024-07-05", nextPaymentDate: "2025-01-29" },
  { id: "std-013", name: "Luciana Restrepo Cardona", document: "1076543209", phone: "3123456789", email: "luciana.restrepo@email.com", program: "Técnico en Farmacia", advisor: "María González", status: "MATRICULADO", totalValue: 3200000, paidAmount: 2400000, remainingBalance: 800000, enrollmentDate: "2024-04-10", nextPaymentDate: "2025-02-10" },
  { id: "std-014", name: "Nicolás Andrés Vargas Beltrán", document: "1065432108", phone: "3134567890", email: "nicolas.vargas@email.com", program: "Auxiliar Administrativo en Salud", advisor: "Carlos Rodríguez", status: "MATRICULADO", totalValue: 2500000, paidAmount: 1250000, remainingBalance: 1250000, enrollmentDate: "2024-09-10", nextPaymentDate: "2025-01-23" },
  { id: "std-015", name: "Gabriela Ríos Castaño", document: "1054321097", phone: "3145678901", email: "gabriela.rios@email.com", program: "Técnico en Atención a la Primera Infancia", advisor: "Ana Martínez", status: "MATRICULADO", totalValue: 2900000, paidAmount: 725000, remainingBalance: 2175000, enrollmentDate: "2024-11-15", nextPaymentDate: "2025-01-21" },
  { id: "std-016", name: "Martín Eduardo Ospina Duque", document: "1043210986", phone: "3156789012", email: "martin.ospina@email.com", program: "Técnico en Enfermería", advisor: "Luis Hernández", status: "MATRICULADO", totalValue: 3500000, paidAmount: 3150000, remainingBalance: 350000, enrollmentDate: "2024-03-01", nextPaymentDate: "2025-02-15" },
  { id: "std-017", name: "Valeria Alejandra Muñoz Arias", document: "1032109875", phone: "3167890123", email: "valeria.munoz@email.com", program: "Auxiliar en Salud Oral", advisor: "María González", status: "MATRICULADO", totalValue: 2800000, paidAmount: 560000, remainingBalance: 2240000, enrollmentDate: "2024-12-01", nextPaymentDate: "2025-01-19" },
  { id: "std-018", name: "Jerónimo Castro Henao", document: "1021098764", phone: "3178901234", email: "jeronimo.castro@email.com", program: "Técnico en Farmacia", advisor: "Carlos Rodríguez", status: "MATRICULADO", totalValue: 3200000, paidAmount: 1920000, remainingBalance: 1280000, enrollmentDate: "2024-06-20", nextPaymentDate: "2025-01-27" },
  { id: "std-019", name: "Emilia Cardona Zapata", document: "1010987653", phone: "3189012345", email: "emilia.cardona@email.com", program: "Auxiliar Administrativo en Salud", advisor: "Ana Martínez", status: "MATRICULADO", totalValue: 2500000, paidAmount: 1875000, remainingBalance: 625000, enrollmentDate: "2024-05-05", nextPaymentDate: "2025-02-03" },
  { id: "std-020", name: "Tomás Felipe Arango Mejía", document: "1009876542", phone: "3190123456", email: "tomas.arango@email.com", program: "Técnico en Atención a la Primera Infancia", advisor: "Luis Hernández", status: "MATRICULADO", totalValue: 2900000, paidAmount: 1160000, remainingBalance: 1740000, enrollmentDate: "2024-08-10", nextPaymentDate: "2025-01-31" },
  { id: "std-021", name: "Mariana López Quintero", document: "1098765430", phone: "3201234567", email: "mariana.lopez@email.com", program: "Técnico en Enfermería", advisor: "María González", status: "MATRICULADO", totalValue: 3500000, paidAmount: 2450000, remainingBalance: 1050000, enrollmentDate: "2024-04-25", nextPaymentDate: "2025-02-08" },
  { id: "std-022", name: "Sebastián Gómez Ríos", document: "1087654319", phone: "3212345678", email: "sebastian.gomez@email.com", program: "Auxiliar en Salud Oral", advisor: "Carlos Rodríguez", status: "MATRICULADO", totalValue: 2800000, paidAmount: 700000, remainingBalance: 2100000, enrollmentDate: "2024-10-05", nextPaymentDate: "2025-01-17" },
  { id: "std-023", name: "Antonella Bedoya Salazar", document: "1076543208", phone: "3223456789", email: "antonella.bedoya@email.com", program: "Técnico en Farmacia", advisor: "Ana Martínez", status: "MATRICULADO", totalValue: 3200000, paidAmount: 2720000, remainingBalance: 480000, enrollmentDate: "2024-02-15", nextPaymentDate: "2025-02-12" },
  { id: "std-024", name: "Maximiliano Torres Giraldo", document: "1065432107", phone: "3234567890", email: "maximiliano.torres@email.com", program: "Auxiliar Administrativo en Salud", advisor: "Luis Hernández", status: "MATRICULADO", totalValue: 2500000, paidAmount: 375000, remainingBalance: 2125000, enrollmentDate: "2024-12-10", nextPaymentDate: "2025-01-16" },
  { id: "std-025", name: "Renata Escobar Herrera", document: "1054321096", phone: "3245678901", email: "renata.escobar@email.com", program: "Técnico en Atención a la Primera Infancia", advisor: "María González", status: "MATRICULADO", totalValue: 2900000, paidAmount: 2030000, remainingBalance: 870000, enrollmentDate: "2024-05-20", nextPaymentDate: "2025-02-06" },
];

const generateReceiptNumber = (index: number): string => {
  const year = 2025;
  const num = String(index + 1).padStart(5, "0");
  return `REC-${year}-${num}`;
};

const paymentDates = [
  "2025-01-20", "2025-01-19", "2025-01-18", "2025-01-17", "2025-01-16",
  "2025-01-15", "2025-01-14", "2025-01-13", "2025-01-12", "2025-01-11",
  "2025-01-10", "2025-01-09", "2025-01-08", "2025-01-07", "2025-01-06",
  "2024-12-20", "2024-12-18", "2024-12-15", "2024-12-10", "2024-12-05",
  "2024-11-28", "2024-11-20", "2024-11-15", "2024-11-10", "2024-11-05",
  "2024-10-25", "2024-10-20", "2024-10-15", "2024-10-10", "2024-10-05",
  "2024-09-25", "2024-09-20", "2024-09-15", "2024-09-10", "2024-09-05",
  "2024-08-25", "2024-08-20", "2024-08-15", "2024-08-10", "2024-08-05",
  "2024-07-25", "2024-07-20", "2024-07-15", "2024-07-10", "2024-07-05",
  "2024-06-25", "2024-06-20", "2024-06-15", "2024-06-10", "2024-06-05",
];

const methods = ["BANCOLOMBIA", "NEQUI", "DAVIPLATA", "EFECTIVO", "OTRO"];
const amounts = [150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000, 175000, 225000, 275000, 325000, 375000, 425000, 475000];

export const DEMO_PAYMENTS = DEMO_STUDENTS.slice(0, 20).flatMap((student, studentIndex) => {
  const numPayments = Math.floor(Math.random() * 3) + 1;
  return Array.from({ length: numPayments }, (_, paymentIndex) => {
    const globalIndex = studentIndex * 3 + paymentIndex;
    return {
      id: `pay-${String(globalIndex + 1).padStart(3, "0")}`,
      receiptNumber: generateReceiptNumber(globalIndex),
      amount: amounts[globalIndex % amounts.length],
      paymentDate: paymentDates[globalIndex % paymentDates.length],
      method: methods[globalIndex % methods.length],
      reference: globalIndex % 3 === 0 ? `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}` : null,
      comments: globalIndex % 4 === 0 ? "Pago correspondiente a cuota mensual" : null,
      student: {
        id: student.id,
        fullName: student.name,
        documentNumber: student.document,
        phone: student.phone,
        programName: student.program,
      },
      registeredBy: {
        name: DEMO_ADVISORS[studentIndex % DEMO_ADVISORS.length].name,
        email: DEMO_ADVISORS[studentIndex % DEMO_ADVISORS.length].email,
      },
    };
  });
});

export const DEMO_CARTERA_SUMMARY = {
  totalPendingAmount: 28535000,
  overdueCount: 5,
  overdueAmount: 3250000,
  todayCount: 3,
  todayAmount: 1875000,
  upcomingCount: 8,
  upcomingAmount: 5200000,
};

export const DEMO_CARTERA_ALERTS = [
  { id: "alert-001", type: "overdue" as const, studentName: "María José Gómez Londoño", studentPhone: "3023315972", amount: 350000, dueDate: "2025-01-10", daysOverdue: 12, advisorName: "Ana Martínez", studentId: "std-011" },
  { id: "alert-002", type: "overdue" as const, studentName: "Valeria Alejandra Muñoz Arias", studentPhone: "3023315972", amount: 280000, dueDate: "2025-01-12", daysOverdue: 10, advisorName: "María González", studentId: "std-017" },
  { id: "alert-003", type: "overdue" as const, studentName: "Sebastián Gómez Ríos", studentPhone: "3023315972", amount: 350000, dueDate: "2025-01-15", daysOverdue: 7, advisorName: "Carlos Rodríguez", studentId: "std-022" },
  { id: "alert-004", type: "overdue" as const, studentName: "Maximiliano Torres Giraldo", studentPhone: "3023315972", amount: 250000, dueDate: "2025-01-16", daysOverdue: 6, advisorName: "Luis Hernández", studentId: "std-024" },
  { id: "alert-005", type: "overdue" as const, studentName: "Gabriela Ríos Castaño", studentPhone: "3023315972", amount: 290000, dueDate: "2025-01-17", daysOverdue: 5, advisorName: "Ana Martínez", studentId: "std-015" },
  { id: "alert-006", type: "today" as const, studentName: "Isabella Hernández Muñoz", studentPhone: "3023315972", amount: 350000, dueDate: "2025-01-22", daysOverdue: 0, advisorName: "Ana Martínez", studentId: "std-007" },
  { id: "alert-007", type: "today" as const, studentName: "Valentina Ramírez Díaz", studentPhone: "3023315972", amount: 400000, dueDate: "2025-01-22", daysOverdue: 0, advisorName: "Ana Martínez", studentId: "std-003" },
  { id: "alert-008", type: "today" as const, studentName: "Nicolás Andrés Vargas Beltrán", studentPhone: "3023315972", amount: 312500, dueDate: "2025-01-22", daysOverdue: 0, advisorName: "Carlos Rodríguez", studentId: "std-014" },
  { id: "alert-009", type: "upcoming" as const, studentName: "Sofía Valentina Torres Ríos", studentPhone: "3023315972", amount: 312500, dueDate: "2025-01-24", daysOverdue: 0, advisorName: "María González", studentId: "std-009" },
  { id: "alert-010", type: "upcoming" as const, studentName: "Laura Sofía Pérez Gómez", studentPhone: "3023315972", amount: 350000, dueDate: "2025-01-25", daysOverdue: 0, advisorName: "María González", studentId: "std-001" },
  { id: "alert-011", type: "upcoming" as const, studentName: "Mateo Alejandro Sánchez Ospina", studentPhone: "3078901234", amount: 400000, dueDate: "2025-01-26", daysOverdue: 0, advisorName: "Luis Hernández", studentId: "std-008" },
  { id: "alert-012", type: "upcoming" as const, studentName: "Jerónimo Castro Henao", studentPhone: "3178901234", amount: 320000, dueDate: "2025-01-27", daysOverdue: 0, advisorName: "Carlos Rodríguez", studentId: "std-018" },
  { id: "alert-013", type: "upcoming" as const, studentName: "Juan David López Torres", studentPhone: "3012345678", amount: 350000, dueDate: "2025-01-28", daysOverdue: 0, advisorName: "Carlos Rodríguez", studentId: "std-002" },
  { id: "alert-014", type: "upcoming" as const, studentName: "Samuel David Jiménez Parra", studentPhone: "3112345678", amount: 280000, dueDate: "2025-01-29", daysOverdue: 0, advisorName: "Luis Hernández", studentId: "std-012" },
  { id: "alert-015", type: "upcoming" as const, studentName: "Camila Andrea García Ruiz", studentPhone: "3045678901", amount: 362500, dueDate: "2025-01-30", daysOverdue: 0, advisorName: "María González", studentId: "std-005" },
];

export const DEMO_STUDENT_DEBTS = DEMO_STUDENTS.filter(s => s.remainingBalance > 0).map(student => ({
  studentId: student.id,
  studentName: student.name,
  documentNumber: student.document,
  phone: student.phone,
  programName: student.program,
  advisorName: student.advisor,
  totalProgramValue: student.totalValue,
  totalPaid: student.paidAmount,
  remainingBalance: student.remainingBalance,
  daysSinceLastPayment: Math.floor(Math.random() * 45) + 5,
}));

export const DEMO_PROSPECTS = [
  { id: "pros-001", name: "Carolina Mendoza Arias", phone: "3023315972", email: "carolina.mendoza@email.com", status: "CONTACTADO" as const, observations: "Interesada en técnico en enfermería. Llamar el viernes.", program: { id: "prog-001", name: "Técnico en Enfermería" }, advisor: { id: "adv-001", name: "María González", email: "maria.gonzalez@instituto.edu.co" }, createdAt: "2025-01-20", nextAction: "Llamar", nextActionDate: "2025-01-24" },
  { id: "pros-002", name: "Pedro José Ramírez Luna", phone: "3023315972", email: "pedro.ramirez@email.com", status: "EN_SEGUIMIENTO" as const, observations: "Solicitó información por WhatsApp. Enviar cotización.", program: { id: "prog-002", name: "Auxiliar en Salud Oral" }, advisor: { id: "adv-002", name: "Carlos Rodríguez", email: "carlos.rodriguez@instituto.edu.co" }, createdAt: "2025-01-18", nextAction: "WhatsApp", nextActionDate: "2025-01-22" },
  { id: "pros-003", name: "Ana María Quintero Vélez", phone: "3023315972", email: "ana.quintero@email.com", status: "EN_SEGUIMIENTO" as const, observations: "Visitó la sede. Muy interesada pero necesita financiación.", program: { id: "prog-003", name: "Técnico en Farmacia" }, advisor: { id: "adv-003", name: "Ana Martínez", email: "ana.martinez@instituto.edu.co" }, createdAt: "2025-01-15", nextAction: "Visita", nextActionDate: "2025-01-25" },
  { id: "pros-004", name: "Jorge Enrique Salazar Díaz", phone: "3004445566", email: "jorge.salazar@email.com", status: "CONTACTADO" as const, observations: "Referido por estudiante actual. Contactar esta semana.", program: { id: "prog-004", name: "Auxiliar Administrativo en Salud" }, advisor: { id: "adv-004", name: "Luis Hernández", email: "luis.hernandez@instituto.edu.co" }, createdAt: "2025-01-19", nextAction: "Llamar", nextActionDate: "2025-01-23" },
  { id: "pros-005", name: "Diana Patricia López Castro", phone: "3005556677", email: "diana.lopez@email.com", status: "CERRADO" as const, observations: "Matriculada el 20 de enero.", program: { id: "prog-005", name: "Técnico en Atención a la Primera Infancia" }, advisor: { id: "adv-001", name: "María González", email: "maria.gonzalez@instituto.edu.co" }, createdAt: "2025-01-10", nextAction: null, nextActionDate: null },
  { id: "pros-006", name: "Mauricio Andrés García Ruiz", phone: "3006667788", email: "mauricio.garcia@email.com", status: "PERDIDO" as const, observations: "No contesta llamadas. Se matriculó en otra institución.", program: { id: "prog-001", name: "Técnico en Enfermería" }, advisor: { id: "adv-002", name: "Carlos Rodríguez", email: "carlos.rodriguez@instituto.edu.co" }, createdAt: "2025-01-05", nextAction: null, nextActionDate: null },
  { id: "pros-007", name: "Sandra Milena Torres Henao", phone: "3007778899", email: "sandra.torres@email.com", status: "EN_SEGUIMIENTO" as const, observations: "Interesada, espera respuesta de crédito ICETEX.", program: { id: "prog-002", name: "Auxiliar en Salud Oral" }, advisor: { id: "adv-003", name: "Ana Martínez", email: "ana.martinez@instituto.edu.co" }, createdAt: "2025-01-12", nextAction: "Llamar", nextActionDate: "2025-01-26" },
  { id: "pros-008", name: "Ricardo Alberto Mejía Ossa", phone: "3008889900", email: "ricardo.mejia@email.com", status: "CONTACTADO" as const, observations: "Preguntó por horarios nocturnos.", program: { id: "prog-003", name: "Técnico en Farmacia" }, advisor: { id: "adv-004", name: "Luis Hernández", email: "luis.hernandez@instituto.edu.co" }, createdAt: "2025-01-21", nextAction: "Email", nextActionDate: "2025-01-23" },
  { id: "pros-009", name: "Luz Elena Cardona Ríos", phone: "3009990011", email: "luz.cardona@email.com", status: "CERRADO" as const, observations: "Matriculada el 15 de enero.", program: { id: "prog-004", name: "Auxiliar Administrativo en Salud" }, advisor: { id: "adv-001", name: "María González", email: "maria.gonzalez@instituto.edu.co" }, createdAt: "2025-01-08", nextAction: null, nextActionDate: null },
  { id: "pros-010", name: "Fernando José Ospina Arango", phone: "3010001122", email: "fernando.ospina@email.com", status: "EN_SEGUIMIENTO" as const, observations: "Solicitó visitar laboratorios.", program: { id: "prog-005", name: "Técnico en Atención a la Primera Infancia" }, advisor: { id: "adv-002", name: "Carlos Rodríguez", email: "carlos.rodriguez@instituto.edu.co" }, createdAt: "2025-01-14", nextAction: "Visita", nextActionDate: "2025-01-24" },
  { id: "pros-011", name: "Claudia Patricia Duque Monsalve", phone: "3011112233", email: "claudia.duque@email.com", status: "CONTACTADO" as const, observations: "Madre de estudiante actual. Interesada para sobrino.", program: { id: "prog-001", name: "Técnico en Enfermería" }, advisor: { id: "adv-003", name: "Ana Martínez", email: "ana.martinez@instituto.edu.co" }, createdAt: "2025-01-17", nextAction: "WhatsApp", nextActionDate: "2025-01-22" },
  { id: "pros-012", name: "Andrés Felipe Restrepo Gil", phone: "3012223344", email: "andres.restrepo@email.com", status: "PERDIDO" as const, observations: "No tiene disponibilidad de horario.", program: { id: "prog-002", name: "Auxiliar en Salud Oral" }, advisor: { id: "adv-004", name: "Luis Hernández", email: "luis.hernandez@instituto.edu.co" }, createdAt: "2025-01-03", nextAction: null, nextActionDate: null },
  { id: "pros-013", name: "Martha Lucía Giraldo Zapata", phone: "3013334455", email: "martha.giraldo@email.com", status: "EN_SEGUIMIENTO" as const, observations: "Interesada, comparando con otra institución.", program: { id: "prog-003", name: "Técnico en Farmacia" }, advisor: { id: "adv-001", name: "María González", email: "maria.gonzalez@instituto.edu.co" }, createdAt: "2025-01-16", nextAction: "Llamar", nextActionDate: "2025-01-25" },
  { id: "pros-014", name: "Julio César Henao Muñoz", phone: "3014445566", email: "julio.henao@email.com", status: "CONTACTADO" as const, observations: "Contacto de feria universitaria. Enviar información.", program: { id: "prog-004", name: "Auxiliar Administrativo en Salud" }, advisor: { id: "adv-002", name: "Carlos Rodríguez", email: "carlos.rodriguez@instituto.edu.co" }, createdAt: "2025-01-20", nextAction: "Email", nextActionDate: "2025-01-22" },
  { id: "pros-015", name: "Patricia Elena Soto Vargas", phone: "3015556677", email: "patricia.soto@email.com", status: "CERRADO" as const, observations: "Matriculada el 18 de enero.", program: { id: "prog-005", name: "Técnico en Atención a la Primera Infancia" }, advisor: { id: "adv-003", name: "Ana Martínez", email: "ana.martinez@instituto.edu.co" }, createdAt: "2025-01-11", nextAction: null, nextActionDate: null },
  { id: "pros-016", name: "Oscar Darío Valencia Pérez", phone: "3016667788", email: "oscar.valencia@email.com", status: "EN_SEGUIMIENTO" as const, observations: "Trabaja, necesita horario flexible.", program: { id: "prog-001", name: "Técnico en Enfermería" }, advisor: { id: "adv-004", name: "Luis Hernández", email: "luis.hernandez@instituto.edu.co" }, createdAt: "2025-01-13", nextAction: "Llamar", nextActionDate: "2025-01-27" },
  { id: "pros-017", name: "Natalia Andrea Correa Londoño", phone: "3017778899", email: "natalia.correa@email.com", status: "CONTACTADO" as const, observations: "Preguntó por becas y descuentos.", program: { id: "prog-002", name: "Auxiliar en Salud Oral" }, advisor: { id: "adv-001", name: "María González", email: "maria.gonzalez@instituto.edu.co" }, createdAt: "2025-01-19", nextAction: "WhatsApp", nextActionDate: "2025-01-23" },
  { id: "pros-018", name: "Hernán Darío Mesa Ocampo", phone: "3018889900", email: "hernan.mesa@email.com", status: "PERDIDO" as const, observations: "Decidió no estudiar por motivos personales.", program: { id: "prog-003", name: "Técnico en Farmacia" }, advisor: { id: "adv-002", name: "Carlos Rodríguez", email: "carlos.rodriguez@instituto.edu.co" }, createdAt: "2025-01-02", nextAction: null, nextActionDate: null },
  { id: "pros-019", name: "Lina María Bermúdez Acosta", phone: "3019990011", email: "lina.bermudez@email.com", status: "EN_SEGUIMIENTO" as const, observations: "Madre soltera, preguntó por guarderías cercanas.", program: { id: "prog-004", name: "Auxiliar Administrativo en Salud" }, advisor: { id: "adv-003", name: "Ana Martínez", email: "ana.martinez@instituto.edu.co" }, createdAt: "2025-01-15", nextAction: "Visita", nextActionDate: "2025-01-28" },
  { id: "pros-020", name: "Carlos Mario Jaramillo Botero", phone: "3020001122", email: "carlos.jaramillo@email.com", status: "CONTACTADO" as const, observations: "Joven recién graduado de bachillerato.", program: { id: "prog-005", name: "Técnico en Atención a la Primera Infancia" }, advisor: { id: "adv-004", name: "Luis Hernández", email: "luis.hernandez@instituto.edu.co" }, createdAt: "2025-01-21", nextAction: "Llamar", nextActionDate: "2025-01-24" },
];

export const DEMO_PROSPECT_SEGUIMIENTOS = [
  { id: "seg-001", prospectId: "pros-001", type: "Llamada", result: "Interesado", date: "2025-01-20", notes: "Muy interesada. Quedó de confirmar fecha de visita.", nextAction: "Esperar confirmación" },
  { id: "seg-002", prospectId: "pros-002", type: "WhatsApp", result: "Interesado", date: "2025-01-18", notes: "Envié brochure digital. Preguntó por precios.", nextAction: "Enviar cotización" },
  { id: "seg-003", prospectId: "pros-003", type: "Visita", result: "Interesado", date: "2025-01-15", notes: "Recorrió las instalaciones. Le gustó mucho.", nextAction: "Seguimiento financiación" },
  { id: "seg-004", prospectId: "pros-007", type: "Llamada", result: "En espera", date: "2025-01-12", notes: "Aplicó a ICETEX, espera respuesta en 15 días.", nextAction: "Llamar en 2 semanas" },
  { id: "seg-005", prospectId: "pros-010", type: "WhatsApp", result: "Interesado", date: "2025-01-14", notes: "Confirmó visita para el 24 de enero.", nextAction: "Preparar tour" },
];

export const DEMO_DASHBOARD_STATS = {
  totalRevenue: 15750000,
  activeStudents: 25,
  pendingPayments: 18,
  conversionRate: 15,
  todayPayments: 3,
  todayAmount: 750000,
  weekPayments: 12,
  weekAmount: 4250000,
};

export const DEMO_REVENUE_CHART = [
  { name: "Semana 1", total: 3250000 },
  { name: "Semana 2", total: 4500000 },
  { name: "Semana 3", total: 3750000 },
  { name: "Semana 4", total: 4250000 },
];

export const DEMO_METHOD_STATS = [
  { method: "BANCOLOMBIA", count: 18, amount: 5400000, percentage: 34 },
  { method: "NEQUI", count: 15, amount: 4125000, percentage: 26 },
  { method: "DAVIPLATA", count: 8, amount: 2200000, percentage: 14 },
  { method: "EFECTIVO", count: 12, amount: 3600000, percentage: 23 },
  { method: "OTRO", count: 2, amount: 425000, percentage: 3 },
];
