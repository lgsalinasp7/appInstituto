/**
 * Receipt PDF Template
 * Generates a professional PDF receipt using @react-pdf/renderer
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register a font (optional, uses default if not available)
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: "2px solid #667eea",
  },
  headerLeft: {
    flex: 1,
  },
  instituteName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#667eea",
    marginBottom: 4,
  },
  instituteSlogan: {
    fontSize: 10,
    color: "#666",
    fontStyle: "italic",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  receiptNumber: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "bold",
  },
  receiptDate: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    paddingBottom: 4,
    borderBottom: "1px solid #e5e7eb",
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: 140,
    color: "#666",
    fontSize: 10,
  },
  value: {
    flex: 1,
    color: "#333",
    fontSize: 10,
    fontWeight: "bold",
  },
  paymentBox: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1px dashed #ccc",
  },
  amountLabel: {
    fontSize: 14,
    color: "#333",
  },
  amountValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#28a745",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
  },
  footerDivider: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: 15,
  },
  footerText: {
    fontSize: 9,
    color: "#999",
    textAlign: "center",
    marginBottom: 4,
  },
  signatureArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    paddingTop: 20,
  },
  signatureBox: {
    width: "45%",
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderTop: "1px solid #333",
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 9,
    color: "#666",
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    fontSize: 60,
    color: "#f0f0f0",
    opacity: 0.3,
  },
  badge: {
    backgroundColor: "#667eea",
    color: "#ffffff",
    padding: "4 8",
    borderRadius: 4,
    fontSize: 9,
    fontWeight: "bold",
  },
});

export interface ReceiptPDFData {
  receiptNumber: string;
  generatedAt: Date;
  student: {
    fullName: string;
    documentNumber: string;
    phone: string;
    email?: string | null;
  };
  program: {
    name: string;
  };
  payment: {
    amount: number;
    paymentDate: Date;
    method: string;
    reference?: string | null;
    paymentType: string;
    moduleNumber?: number | null;
  };
  registeredBy: {
    name: string;
  };
  balanceAfter?: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatPaymentMethod(method: string): string {
  const methods: Record<string, string> = {
    EFECTIVO: "Efectivo",
    BANCOLOMBIA: "Bancolombia",
    NEQUI: "Nequi",
    DAVIPLATA: "Daviplata",
    TRANSFERENCIA: "Transferencia",
    TARJETA: "Tarjeta",
  };
  return methods[method] || method;
}

function formatPaymentType(type: string): string {
  const types: Record<string, string> = {
    MATRICULA: "Pago de Matrícula",
    MODULO: "Pago de Módulo",
  };
  return types[type] || type;
}

export function ReceiptPDF({ data }: { data: ReceiptPDFData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.instituteName}>Instituto</Text>
            <Text style={styles.instituteSlogan}>
              Educamos con Valores - Formación Técnica Profesional
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.receiptTitle}>RECIBO DE PAGO</Text>
            <Text style={styles.receiptNumber}>{data.receiptNumber}</Text>
            <Text style={styles.receiptDate}>
              {formatDate(data.generatedAt)}
            </Text>
          </View>
        </View>

        {/* Student Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS DEL ESTUDIANTE</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{data.student.fullName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Documento:</Text>
            <Text style={styles.value}>{data.student.documentNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>{data.student.phone}</Text>
          </View>
          {data.student.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{data.student.email}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Programa:</Text>
            <Text style={styles.value}>{data.program.name}</Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.paymentBox}>
          <Text style={styles.sectionTitle}>DETALLES DEL PAGO</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Concepto:</Text>
            <Text style={styles.value}>
              {formatPaymentType(data.payment.paymentType)}
              {data.payment.moduleNumber
                ? ` - Módulo ${data.payment.moduleNumber}`
                : ""}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de Pago:</Text>
            <Text style={styles.value}>
              {formatDate(data.payment.paymentDate)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Método de Pago:</Text>
            <Text style={styles.value}>
              {formatPaymentMethod(data.payment.method)}
            </Text>
          </View>
          {data.payment.reference && (
            <View style={styles.row}>
              <Text style={styles.label}>Referencia:</Text>
              <Text style={styles.value}>{data.payment.reference}</Text>
            </View>
          )}

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>TOTAL PAGADO:</Text>
            <Text style={styles.amountValue}>
              {formatCurrency(data.payment.amount)}
            </Text>
          </View>
        </View>

        {/* Balance Information (if available) */}
        {data.balanceAfter !== undefined && (
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>Saldo Pendiente:</Text>
              <Text style={styles.value}>
                {formatCurrency(data.balanceAfter)}
              </Text>
            </View>
          </View>
        )}

        {/* Signature Area */}
        <View style={styles.signatureArea}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Firma del Estudiante</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>
              Registrado por: {data.registeredBy.name}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDivider}>
            <Text style={styles.footerText}>
              Este documento es un comprobante oficial de pago emitido por el
              Instituto.
            </Text>
            <Text style={styles.footerText}>
              Conserve este recibo como soporte de su transacción.
            </Text>
            <Text style={styles.footerText}>
              Para consultas: info@instituto.edu.co | Tel: (601) 123-4567
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default ReceiptPDF;
