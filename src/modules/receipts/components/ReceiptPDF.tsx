/**
 * Receipt PDF Template - Clone of Manual Receipt
 * Size: Half Letter (Landscape roughly) or Custom
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { numberToWords } from "@/lib/number-utils";

// Colors
const BLUE_BORDER = "#1e3a8a"; // Dark Blue similar to image
const TEXT_BLUE = "#1e3a8a";
const RED_NUM = "#dc2626";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 9,
    fontFamily: "Helvetica", // Changed from Inter to built-in Helvetica
    backgroundColor: "#ffffff",
  },
  container: {
    border: `2px solid ${BLUE_BORDER}`,
    borderRadius: 10,
    height: "100%",
    padding: 10,
    display: "flex",
    flexDirection: "column",
  },
  // HEADER
  header: {
    flexDirection: "row",
    height: 90,
    marginBottom: 5,
  },
  headerLeft: {
    width: "70%",
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  titleContainer: {
    flexDirection: "column",
  },
  titleMain: {
    fontSize: 16,
    fontWeight: "bold",
    color: TEXT_BLUE,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  titleSub: {
    fontSize: 12,
    fontWeight: "bold",
    color: TEXT_BLUE,
  },
  address: {
    fontSize: 7,
    marginTop: 5,
    color: "#444", // Removed fontStyle: italic
  },
  headerRight: {
    width: "30%",
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  numberBox: {
    border: `1px solid ${BLUE_BORDER}`,
    borderRadius: 5,
    padding: 5,
    width: "100%",
    alignItems: "center",
    marginBottom: 5,
    backgroundColor: "#f0f9ff",
  },
  numberText: {
    fontSize: 16,
    color: RED_NUM,
    fontWeight: "bold",
  },
  dateBoxContainer: {
    width: "100%",
    border: `1px solid ${BLUE_BORDER}`,
    borderRadius: 5,
    overflow: "hidden",
  },
  dateHeader: {
    backgroundColor: TEXT_BLUE,
    color: "white",
    fontSize: 8,
    textAlign: "center",
    paddingVertical: 2,
    fontWeight: "bold",
  },
  dateInputs: {
    flexDirection: "row",
    borderTop: `1px solid ${BLUE_BORDER}`,
  },
  dateCol: {
    flex: 1,
    borderRight: `1px solid ${BLUE_BORDER}`,
    alignItems: "center",
    justifyContent: "center",
    height: 20,
  },
  dateVal: {
    fontSize: 9,
    fontWeight: "bold",
  },
  dateLabel: {
    fontSize: 6,
    color: "#666",
    marginTop: 1,
  },

  // BODY ROWS
  rowFull: {
    marginBottom: 4,
    border: `1px solid ${BLUE_BORDER}`,
    borderRadius: 5,
    padding: 0,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "stretch", // Stretch height
  },
  rowLabel: {
    backgroundColor: "#e0f2fe", // Light blue bg for labels just to distinguish or white? Image has white bg for inputs but some headers? 
    // Image shows labels inside the box, or split. 
    // "Ciudad:" is inside the box.
    padding: 5,
    fontSize: 8,
    color: TEXT_BLUE,
    fontWeight: "bold",
    width: 80, // fixed width for label part if we simulate "Label: ____________"
  },
  rowContent: {
    padding: 5,
    fontSize: 9,
    flex: 1,
    color: "#000",
  },

  // Specific Rows configuration
  rowDouble: {
    flexDirection: "row",
    marginBottom: 4,
    gap: 5,
  },
  colHalf: {
    flex: 1,
    border: `1px solid ${BLUE_BORDER}`,
    borderRadius: 5,
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
  },

  // Currency Box
  currencyBox: {
    width: 100,
    backgroundColor: TEXT_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  currencySymbol: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Table-like strips
  stripRow: {
    border: `1px solid ${BLUE_BORDER}`,
    borderRadius: 5,
    height: 25,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    backgroundColor: "#f8fafc",
  },
  stripLabel: {
    color: TEXT_BLUE,
    fontSize: 8,
    fontWeight: "bold",
    marginRight: 5,
    minWidth: 80,
  },
  stripValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
    borderBottom: "1px dotted #999", // dotted line simulation
    paddingBottom: 2,
  },

  // FOOTER
  footerRow: {
    flexDirection: "row",
    marginTop: 10,
    height: 50,
    gap: 10,
  },
  footerBox: {
    flex: 1,
    border: `1px solid ${BLUE_BORDER}`,
    borderRadius: 5,
    padding: 5,
    justifyContent: "flex-end",
  },
  footerLabel: {
    position: "absolute",
    top: 5,
    left: 5,
    fontSize: 7,
    color: TEXT_BLUE,
    fontWeight: "bold",
  },
  footerValue: {
    textAlign: "center",
    fontSize: 9,
    borderTop: "1px solid #ccc",
    paddingTop: 2,
    marginTop: 15,
  },
  verticalText: {
    // React-pdf doesn't support writing-mode easily. Ignoring side text for now.
  }
});

export interface ReceiptPDFData {
  receiptNumber: string;
  generatedAt: Date;
  student: {
    fullName: string;
    documentNumber: string;
    phone: string;
    email?: string | null;
    city?: string | null;
    address?: string | null;
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
  /** Datos del tenant para personalizar el recibo */
  tenant?: {
    name: string;
    address?: string;
    phone?: string;
  };
}

function formatDateParts(date: Date) {
  const d = new Date(date);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: String(d.getMonth() + 1).padStart(2, "0"),
    year: String(d.getFullYear()),
  };
}

export function ReceiptPDF({ data }: { data: ReceiptPDFData }) {
  const dateParts = formatDateParts(data.payment.paymentDate);
  const amountInWords = numberToWords(data.payment.amount);

  return (
    <Document>
      {/* 
         Size: [612, 396] is 8.5 x 5.5 inches (Half Letter Landscape).
         It fits typical manual receipt formats.
      */}
      <Page size={[612, 396]} style={styles.page}>
        <View style={styles.container}>

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {/* Try to use logo if available, else text placeholder */}
              {/* <Image src="/logo-instituto.png" style={styles.logo} /> */}
              {/* React-PDF needs absolute path or URL. We'll rely on public asset being served or local fs? 
                  For now, text fallback is safer if image path is tricky in dev vs prod without proper setup.
                  But let's try assuming standard access or just Text. */}
              <View style={styles.titleContainer}>
                <Text style={styles.titleMain}>{data.tenant?.name || "Institucion Educativa"}</Text>
                <Text style={styles.titleSub}>Recibo de Pago</Text>
                {data.tenant?.address && (
                  <Text style={styles.address}>{data.tenant.address}</Text>
                )}
                {data.tenant?.phone && (
                  <Text style={styles.address}>{data.tenant.phone}</Text>
                )}
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.numberBox}>
                <Text style={styles.numberText}>{data.receiptNumber}</Text>
              </View>
              <View style={styles.dateBoxContainer}>
                <Text style={styles.dateHeader}>FECHA</Text>
                <View style={styles.dateInputs}>
                  <View style={styles.dateCol}>
                    <Text style={styles.dateVal}>{dateParts.day}</Text>
                    <Text style={styles.dateLabel}>DD</Text>
                  </View>
                  <View style={styles.dateCol}>
                    <Text style={styles.dateVal}>{dateParts.month}</Text>
                    <Text style={styles.dateLabel}>MM</Text>
                  </View>
                  <View style={[styles.dateCol, { borderRight: 0, flex: 1.5 }]}>
                    <Text style={styles.dateVal}>{dateParts.year}</Text>
                    <Text style={styles.dateLabel}>AAAA</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* ROW 1: Ciudad | Grupo | $ */}
          <View style={styles.rowDouble}>
            <View style={[styles.colHalf, { flex: 2 }]}>
              <Text style={styles.stripLabel}>Ciudad:</Text>
              <Text style={styles.stripValue}>{data.student.city || "N/A"}</Text>
            </View>
            {/* <View style={[styles.colHalf, { flex: 1 }]}>
              <Text style={styles.stripLabel}>Grupo:</Text>
              <Text style={styles.stripValue}></Text>
            </View> */}
            <View style={[styles.colHalf, { flex: 1, backgroundColor: "#E9F0FD", border: `2px solid ${BLUE_BORDER}` }]}>
              <Text style={{ fontSize: 13, fontWeight: 'bold' }}>
                $ {data.payment.amount.toLocaleString('es-CO')}
              </Text>
            </View>
          </View>

          {/* ROW 2: Recibí de */}
          <View style={styles.stripRow}>
            <Text style={styles.stripLabel}>Recibí de:</Text>
            <Text style={styles.stripValue}>{data.student.fullName}</Text>
          </View>

          {/* ROW 3: C.C | La Suma de */}
          <View style={styles.stripRow}>
            <View style={{ backgroundColor: TEXT_BLUE, paddingHorizontal: 5, paddingVertical: 2, marginRight: 5, borderRadius: 2 }}>
              <Text style={{ color: 'white', fontSize: 8, fontWeight: 'bold' }}>C.C.</Text>
            </View>
            <Text style={[styles.stripValue, { flex: 0.3, marginRight: 10 }]}>{data.student.documentNumber}</Text>

            <Text style={styles.stripLabel}>La Suma de (en letras):</Text>
            <Text style={[styles.stripValue, { fontSize: 8 }]}>{amountInWords}</Text>
          </View>

          {/* ROW 4: Grado/Programa */}
          <View style={styles.stripRow}>
            <Text style={styles.stripLabel}>Grado / Programa:</Text>
            <Text style={styles.stripValue}>{data.program.name}</Text>
          </View>

          {/* ROW 5: Por Concepto de */}
          <View style={[styles.stripRow, { height: 35 }]}>
            <Text style={styles.stripLabel}>Por Concepto de:</Text>
            <Text style={styles.stripValue}>
              {data.payment.paymentType === 'MATRICULA' ? 'MATRÍCULA' :
                data.payment.moduleNumber ? `PAGO MÓDULO ${data.payment.moduleNumber}` : 'PAGO MÓDULO'}
              {data.payment.reference ? ` - REF: ${data.payment.reference}` : ''}
              {' '}({data.payment.method})
            </Text>
          </View>

          {/* ROW 6: Medio de Pago */}
          <View style={styles.stripRow}>
            <Text style={styles.stripLabel}>Medio de Pago:</Text>
            <Text style={styles.stripValue}>{data.payment.method}</Text>
          </View>

          {/* FOOTER AREA */}
          <View style={styles.footerRow}>
            <View style={styles.footerBox}>
              <Text style={styles.footerLabel}>No. de Aprobación:</Text>
              <Text style={{ marginTop: 15, fontSize: 9 }}>{data.payment.reference || 'N/A'}</Text>
            </View>
            <View style={styles.footerBox}>
              <Text style={styles.footerLabel}>Elaboró:</Text>
              <Text style={{ marginTop: 15, fontSize: 9 }}>{data.registeredBy.name}</Text>
            </View>
            {/* Use empty box for signature or Valor Restante? Image had Valor Restante bottom left, Elaboro bottom right */}
          </View>

          <View style={styles.footerRow}>
            <View style={[styles.footerBox, { flex: 0.5 }]}>
              <Text style={styles.footerLabel}>Valor Restante:</Text>
              <Text style={{ marginTop: 15, fontSize: 9 }}>
                {data.balanceAfter !== undefined ? `$ ${data.balanceAfter.toLocaleString('es-CO')}` : '---'}
              </Text>
            </View>
            <View style={styles.footerBox}>
              <Text style={styles.footerLabel}>Firma y Sello:</Text>
            </View>
          </View>

        </View>
      </Page>
    </Document>
  );
}

export default ReceiptPDF;
