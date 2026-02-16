#!/usr/bin/env node
/**
 * Script para probar el login con credenciales (email + contraseña temporal)
 * Uso: node scripts/test-login.mjs <email> <password> [tenant-slug]
 *
 * Ejemplo: node scripts/test-login.mjs admin@edutec.edu.co MyfwEXfrxq edutec
 *
 * Si no se pasa tenant-slug, usa el primer subdominio del email o "edutec" por defecto.
 */

const email = process.argv[2];
const password = process.argv[3];
const tenantSlug = process.argv[4] || "edutec";
const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kaledsoft.tech";

if (!email || !password) {
  console.error("Uso: node scripts/test-login.mjs <email> <password> [tenant-slug]");
  console.error("Ejemplo: node scripts/test-login.mjs admin@edutec.edu.co MiContraseña123 edutec");
  process.exit(1);
}

const loginUrl = `https://${tenantSlug}.${rootDomain}/api/auth/login`;

console.log(`\nProbando login en: ${loginUrl}`);
console.log(`Email: ${email}`);
console.log(`Password: ${password.replace(/./g, "*")}\n`);

try {
  const res = await fetch(loginUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  console.log(`Status: ${res.status}`);
  console.log(`Response:`, JSON.stringify(data, null, 2));

  if (res.ok && data.success) {
    console.log("\n✓ Login exitoso");
  } else {
    console.log("\n✗ Login fallido:", data.error || data.message || "Error desconocido");
  }
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
