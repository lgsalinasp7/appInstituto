import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { key, value } = await request.json();

        if (!key || value === undefined) {
            return NextResponse.json({ success: false, error: "Key and value are required" }, { status: 400 });
        }

        const config = await prisma.systemConfig.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });

        return NextResponse.json({ success: true, data: config });
    } catch (error) {
        console.error("Error updating config:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
