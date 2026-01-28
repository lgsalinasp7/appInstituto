
import { PrismaClient } from "@prisma/client";
import { PaymentService } from "../src/modules/payments/services/payment.service";
import { DashboardService } from "../src/modules/dashboard/services/dashboard.service";
import { ProspectService } from "../src/modules/prospects/services/prospect.service";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting System Verification...");

    try {
        // 1. Basic DB Connection & Counts
        const userCount = await prisma.user.count();
        console.log(`✅ Users found: ${userCount}`);

        const studentCount = await prisma.student.count();
        console.log(`✅ Students found: ${studentCount}`);

        const prospectCount = await prisma.prospect.count();
        console.log(`✅ Prospects found: ${prospectCount}`);

        // 2. Service Verifications

        // Dashboard Stats
        console.log("\nTesting DashboardService...");
        const dashboardStats = await DashboardService.getDashboardStats();
        console.log(`✅ Dashboard Stats fetched. Revenue this month: ${dashboardStats.monthlyRevenue}`);

        // Cartera (Debts)
        console.log("\nTesting PaymentService (Cartera)...");
        const debtsParams = { page: 1, limit: 5 };
        const debts = await PaymentService.getDebts(debtsParams);
        console.log(`✅ Debts fetched. Total records: ${debts.total}`);

        // Cartera Stats
        const carteraStats = await PaymentService.getCarteraStats();
        console.log(`✅ Cartera Stats fetched. Total Pending: ${carteraStats.totalPendingAmount}`);


        // Prospects Stats
        console.log("\nTesting ProspectService...");
        const prospectStats = await ProspectService.getStats();
        console.log(`✅ Prospect Stats fetched. Conversion Rate: ${prospectStats.conversionRate}%`);

        console.log("\n🎉 ALL SYSTEMS GO! Refactor Verification Successful.");

    } catch (error) {
        console.error("\n❌ Verification FAILED:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
