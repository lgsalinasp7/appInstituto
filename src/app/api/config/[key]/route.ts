import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ key: string }> }
) {
    try {
        const { key } = await params;
        const config = await prisma.systemConfig.findUnique({
            where: { key },
        });

        if (!config) {
            // Valor por defecto si no existe
            if (key === "MONTHLY_GOAL") {
                return NextResponse.json({ success: true, data: { key: "MONTHLY_GOAL", value: "10000000" } });
            }
            return NextResponse.json({ success: false, error: "Config not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: config });
    } catch (error) {
        console.error("Error fetching config:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
