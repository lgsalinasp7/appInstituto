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

    const payment = await prisma.payment.findUnique({
      where: { id },
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

    // Prepare data for PDF
    const pdfData = {
      receiptNumber: payment.receiptNumber,
      generatedAt: new Date(),
      student: {
        fullName: payment.student.fullName,
        documentNumber: payment.student.documentNumber,
        phone: payment.student.phone,
        email: payment.student.email,
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
      // Note: Calculating balanceAfter accurately per payment would require 
      // summing history, so we'll just show the student's program info for now 
      // or omit it to keep it simple and accurate for the receipt itself.
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
