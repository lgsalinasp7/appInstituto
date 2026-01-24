import prisma from "@/lib/prisma";
import type { ReceiptData } from "../types";

export class ReceiptService {
  static async getReceiptByPaymentId(paymentId: string): Promise<ReceiptData | null> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        receipt: true,
        student: {
          include: {
            program: {
              select: { name: true },
            },
            payments: {
              select: { amount: true },
            },
          },
        },
        registeredBy: {
          select: { name: true, email: true },
        },
      },
    });

    if (!payment) return null;

    const totalPaid = payment.student.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const totalProgramValue = Number(payment.student.totalProgramValue);
    const remainingBalance = totalProgramValue - totalPaid;

    let receipt = payment.receipt;

    if (!receipt) {
      receipt = await prisma.receipt.create({
        data: {
          receiptNumber: payment.receiptNumber,
          paymentId: payment.id,
        },
      });
    }

    return {
      id: receipt.id,
      receiptNumber: receipt.receiptNumber,
      generatedAt: receipt.generatedAt,
      sentVia: receipt.sentVia,
      sentAt: receipt.sentAt,
      pdfUrl: receipt.pdfUrl,
      payment: {
        id: payment.id,
        amount: Number(payment.amount),
        paymentDate: payment.paymentDate,
        method: payment.method,
        reference: payment.reference,
      },
      student: {
        id: payment.student.id,
        fullName: payment.student.fullName,
        documentType: payment.student.documentType,
        documentNumber: payment.student.documentNumber,
        phone: payment.student.phone,
        email: payment.student.email,
        program: payment.student.program,
      },
      registeredBy: payment.registeredBy,
      balance: {
        totalProgramValue,
        totalPaid,
        remainingBalance,
      },
    };
  }

  static async getReceiptByNumber(receiptNumber: string): Promise<ReceiptData | null> {
    const receipt = await prisma.receipt.findUnique({
      where: { receiptNumber },
      include: {
        payment: {
          include: {
            student: {
              include: {
                program: {
                  select: { name: true },
                },
                payments: {
                  select: { amount: true },
                },
              },
            },
            registeredBy: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    if (!receipt) return null;

    const totalPaid = receipt.payment.student.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const totalProgramValue = Number(receipt.payment.student.totalProgramValue);
    const remainingBalance = totalProgramValue - totalPaid;

    return {
      id: receipt.id,
      receiptNumber: receipt.receiptNumber,
      generatedAt: receipt.generatedAt,
      sentVia: receipt.sentVia,
      sentAt: receipt.sentAt,
      pdfUrl: receipt.pdfUrl,
      payment: {
        id: receipt.payment.id,
        amount: Number(receipt.payment.amount),
        paymentDate: receipt.payment.paymentDate,
        method: receipt.payment.method,
        reference: receipt.payment.reference,
      },
      student: {
        id: receipt.payment.student.id,
        fullName: receipt.payment.student.fullName,
        documentType: receipt.payment.student.documentType,
        documentNumber: receipt.payment.student.documentNumber,
        phone: receipt.payment.student.phone,
        email: receipt.payment.student.email,
        program: receipt.payment.student.program,
      },
      registeredBy: receipt.payment.registeredBy,
      balance: {
        totalProgramValue,
        totalPaid,
        remainingBalance,
      },
    };
  }

  static async markAsSent(receiptId: string, via: string): Promise<void> {
    await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        sentVia: via,
        sentAt: new Date(),
      },
    });
  }

  static generateWhatsAppMessage(receipt: ReceiptData): string {
    const message = `
*RECIBO DE PAGO*
━━━━━━━━━━━━━━━━
📋 Recibo: ${receipt.receiptNumber}
📅 Fecha: ${new Date(receipt.payment.paymentDate).toLocaleDateString("es-CO")}

👤 *Estudiante:*
${receipt.student.fullName}
${receipt.student.documentType}: ${receipt.student.documentNumber}

📚 *Programa:*
${receipt.student.program.name}

💰 *Detalle del Pago:*
Monto: $${receipt.payment.amount.toLocaleString()}
Método: ${receipt.payment.method}
${receipt.payment.reference ? `Referencia: ${receipt.payment.reference}` : ""}

📊 *Estado de Cuenta:*
Total Programa: $${receipt.balance.totalProgramValue.toLocaleString()}
Total Pagado: $${receipt.balance.totalPaid.toLocaleString()}
Saldo Pendiente: $${receipt.balance.remainingBalance.toLocaleString()}

━━━━━━━━━━━━━━━━
_Educamos con Valores_
    `.trim();

    return encodeURIComponent(message);
  }

  static generateWhatsAppUrl(receipt: ReceiptData, phoneNumber?: string): string {
    const message = this.generateWhatsAppMessage(receipt);
    const phone = phoneNumber || receipt.student.phone;
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`;
    
    return `https://wa.me/${formattedPhone}?text=${message}`;
  }

  static async getStudentReceipts(studentId: string) {
    const payments = await prisma.payment.findMany({
      where: { studentId },
      include: {
        receipt: true,
        registeredBy: {
          select: { name: true, email: true },
        },
      },
      orderBy: { paymentDate: "desc" },
    });

    return payments.map((payment) => ({
      id: payment.receipt?.id || payment.id,
      receiptNumber: payment.receiptNumber,
      amount: Number(payment.amount),
      paymentDate: payment.paymentDate,
      method: payment.method,
      reference: payment.reference,
      sentVia: payment.receipt?.sentVia || null,
      sentAt: payment.receipt?.sentAt || null,
      registeredBy: payment.registeredBy,
    }));
  }
}
