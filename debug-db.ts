
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import * as fs from "fs";
import * as path from "path";

// Leer .env manualmente para asegurar que se cargue
const envPath = path.resolve(__dirname, "./.env");
const envContent = fs.readFileSync(envPath, "utf8");
const envLines = envContent.split("\n");

let connectionString = "";
for (const line of envLines) {
    if (line.startsWith("DATABASE_URL=")) {
        connectionString = line.replace("DATABASE_URL=", "").replace(/"/g, "").trim();
        break;
    }
}

process.env.DATABASE_URL = connectionString;
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Roles...");
    const roles = await prisma.role.findMany();
    console.log("Current Roles:", JSON.stringify(roles, null, 2));

    console.log("Checking Users...");
    const users = await prisma.user.findMany({
        include: { role: true }
    });
    console.log("Current Users Count:", users.length);
    users.forEach(u => console.log(`${u.email} - ${u.role.name}`));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
