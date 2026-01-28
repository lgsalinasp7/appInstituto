import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { renderToStream } from "@react-pdf/renderer";
import React from "react";
import ReceiptPDF from "@/modules/receipts/components/ReceiptPDF";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Search by id OR receiptNumber to support both
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { id },
          { receiptNumber: id }
        ]
      },
      include: {
        student: {
          include: {
            program: true,
          },
        },
        registeredBy: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    // Calculate balance
    // Note: This calculates balance NOW, not at the time of payment.
    // For a receipt, usually "Remaining Balance" means current debt.
    const totalProgramValue = Number(payment.student.totalProgramValue);
    const totalPayments = await prisma.payment.aggregate({
      where: { studentId: payment.student.id },
      _sum: { amount: true }
    });
    const totalPaid = Number(totalPayments._sum.amount) || 0;
    const balanceAfter = totalProgramValue - totalPaid;

    // Resolve absolute path to logo
    const path = require('path');
    const process = require('process');
    const logoPath = path.join(process.cwd(), 'public', 'logo-edutec.png');

    // Prepare data for PDF
    const pdfData = {
      receiptNumber: payment.receiptNumber,
      generatedAt: new Date(),
      student: {
        fullName: payment.student.fullName,
        documentNumber: payment.student.documentNumber,
        phone: payment.student.phone,
        email: payment.student.email,
        address: payment.student.address,
      },
      program: {
        name: payment.student.program.name,
      },
      payment: {
        amount: Number(payment.amount),
        paymentDate: payment.paymentDate,
        method: payment.method,
        reference: payment.reference,
        paymentType: payment.paymentType,
        moduleNumber: payment.moduleNumber,
      },
      registeredBy: {
        name: payment.registeredBy.name || "Sistema",
      },
      balanceAfter: balanceAfter,
      logoSrc: logoPath
    };

    // Render PDF to stream
    const stream = await renderToStream(
      React.createElement(ReceiptPDF, { data: pdfData }) as any
    );

    // Return as PDF response
    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=recibo-${payment.receiptNumber}.pdf`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { success: false, error: "Error al generar el PDF" },
      { status: 500 }
    );
  }
}
