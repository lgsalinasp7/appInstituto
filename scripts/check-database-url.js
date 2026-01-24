#!/usr/bin/env node

/**
 * Script para verificar y recomendar configuración de DATABASE_URL
 * Basado en la implementación de amaxoft-admin
 * Ejecutar con: node scripts/check-database-url.js
 */

const fs = require("fs");
const path = require("path");

// Colores para la consola
const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
};

function log(message, color = "reset") {
    console.log(colors[color] + message + colors.reset);
}

function checkDatabaseUrl() {
    log("\n🔍 Verificando configuración de DATABASE_URL para App Instituto...\n", "cyan");

    // Leer archivo .env (AppInstitutoProvisional usa .env)
    const envPath = path.join(process.cwd(), ".env");

    if (!fs.existsSync(envPath)) {
        log("❌ Error: No se encontró el archivo .env", "red");
        log("   Crea el archivo .env en la raíz del proyecto", "yellow");
        return;
    }

    const envContent = fs.readFileSync(envPath, "utf8");
    const lines = envContent.split(/\r?\n/);

    // Buscar DATABASE_URL
    let databaseUrlLine = lines.find((line) => line.trim().startsWith("DATABASE_URL="));

    if (!databaseUrlLine) {
        log("❌ Error: No se encontró DATABASE_URL en .env", "red");
        return;
    }

    // Extraer la URL
    let databaseUrl = databaseUrlLine.replace("DATABASE_URL=", "").trim();
    // Remover comillas si existen
    databaseUrl = databaseUrl.replace(/^["']|["']$/g, '');

    if (!databaseUrl || databaseUrl.includes("username") || databaseUrl.includes("password")) {
        log("❌ Error: DATABASE_URL contiene valores de ejemplo", "red");
        log("   Reemplaza con tu URL real de Neon", "yellow");
        return;
    }

    log("✅ DATABASE_URL encontrado", "green");

    // Analizar la URL
    try {
        const url = new URL(databaseUrl);

        log("\n📊 Información de conexión:", "cyan");
        log(`   Host: ${url.hostname}`, "blue");
        log(`   Puerto: ${url.port || "5432 (default)"}`, "blue");
        log(`   Base de datos: ${url.pathname.replace("/", "")}`, "blue");

        // Verificar parámetros recomendados
        const params = new URLSearchParams(url.search);

        log("\n🔧 Parámetros de conexión encontrados:", "cyan");
        params.forEach((value, key) => {
            log(`   - ${key}: ${value}`, "blue");
        });

        const recommendedParams = {
            sslmode: { expected: "require", critical: true },
            pgbouncer: { expected: "true", critical: true },
            connect_timeout: { expected: "60", critical: false },
            pool_timeout: { expected: "20", critical: false },
            connection_limit: { expected: "10", critical: false },
            statement_cache_size: { expected: "0", critical: true },
        };

        let hasIssues = false;
        let missingOrWrongParams = [];

        log("\n🛠️ Verificación de parámetros óptimos:", "cyan");

        for (const [param, config] of Object.entries(recommendedParams)) {
            const value = params.get(param);

            if (!value) {
                const symbol = config.critical ? "❌" : "⚠️";
                const colorName = config.critical ? "red" : "yellow";
                log(`   ${symbol} ${param}: No configurado`, colorName);
                missingOrWrongParams.push({ param, config });
                hasIssues = true;
            } else if (value !== config.expected) {
                log(`   ⚠️  ${param}: ${value} (recomendado: ${config.expected})`, "yellow");
                missingOrWrongParams.push({ param, config });
                hasIssues = true;
            } else {
                log(`   ✅ ${param}: ${value}`, "green");
            }
        }

        // Verificar endpoint pooler para Neon
        if (url.hostname.includes("neon.tech") && !url.hostname.includes("-pooler.")) {
            log("\n⚠️  Advertencia: No estás usando el endpoint pooler de Neon", "yellow");
            log('   Se recomienda usar el host con "-pooler" para habilitar PgBouncer.', "yellow");
            hasIssues = true;
        }

        // Generar URL corregida
        if (hasIssues) {
            log("\n🔧 URL corregida recomendada:", "cyan");

            // Actualizar parámetros
            for (const [param, config] of Object.entries(recommendedParams)) {
                params.set(param, config.expected);
            }

            const correctedUrl = `${url.protocol}//${url.username}:${url.password}@${url.hostname}${url.port ? ":" + url.port : ""}${url.pathname}?${params.toString()}`;

            log("\n" + correctedUrl, "blue");

            log("\n📝 Pasos para corregir:", "cyan");
            log("1. Copia la URL de arriba", "yellow");
            log("2. Reemplaza el valor de DATABASE_URL en tu .env", "yellow");
            log("3. Reinicia el servidor: npm run dev", "yellow");
        } else {
            log("\n✅ Tu configuración de conexión es ÓPTIMA y robusta.", "green");
        }

        log("\n💡 Nota: Esta configuración previene errores de 'PostgreSQL connection closed' comunes en Neon por inactividad.", "cyan");
    } catch (error) {
        log("❌ Error al analizar DATABASE_URL:", "red");
        log(`   ${error.message}`, "red");
    }

    log("");
}

// Ejecutar verificación
checkDatabaseUrl();
