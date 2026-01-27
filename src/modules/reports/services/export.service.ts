import ExcelJS from "exceljs";
import prisma from "@/lib/prisma";

export class ExportService {
    static async exportPaymentsToExcel(filters: {
        startDate?: Date;
        endDate?: Date;
        method?: string;
    }): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Pagos");

        // Define columns
        worksheet.columns = [
            { header: "ID Recibo", key: "receiptNumber", width: 20 },
            { header: "Fecha", key: "paymentDate", width: 15 },
            { header: "Estudiante", key: "studentName", width: 30 },
            { header: "Documento", key: "documentNumber", width: 15 },
            { header: "Programa", key: "programName", width: 25 },
            { header: "Monto", key: "amount", width: 15 },
            { header: "Método", key: "method", width: 15 },
            { header: "Referencia", key: "reference", width: 20 },
            { header: "Registrado por", key: "advisorName", width: 25 },
            { header: "Tipo", key: "paymentType", width: 15 },
        ];

        // Style header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4F46E5" }, // Primary color
        };
        worksheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };

        const where: any = {};
        if (filters.startDate || filters.endDate) {
            where.paymentDate = {};
            if (filters.startDate) where.paymentDate.gte = filters.startDate;
            if (filters.endDate) where.paymentDate.lte = filters.endDate;
        }
        if (filters.method) where.method = filters.method;

        const payments = await prisma.payment.findMany({
            where,
            include: {
                student: {
                    include: { program: true }
                },
                registeredBy: true,
            },
            orderBy: { paymentDate: "desc" },
        });

        // Add data
        payments.forEach((p) => {
            worksheet.addRow({
                receiptNumber: p.receiptNumber,
                paymentDate: p.paymentDate.toLocaleDateString("es-CO"),
                studentName: p.student.fullName,
                documentNumber: p.student.documentNumber,
                programName: p.student.program.name,
                amount: Number(p.amount),
                method: p.method,
                reference: p.reference || "-",
                advisorName: p.registeredBy?.name || "Sistema",
                paymentType: p.paymentType,
            });
        });

        // Format amount column as currency
        worksheet.getColumn("amount").numFmt = '"$"#,##0.00';

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
