# Datos de Seed - Usuarios y Autenticación

> Documentación de los datos de prueba generados por `prisma/seed.ts`

---

## 1. ROLES DEL SISTEMA

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **admin** | Administrador del sistema | `["all"]` - Acceso completo |
| **asesor** | Asesor educativo | `["read", "write"]` - Lectura y escritura |

---

## 2. USUARIOS DE PRUEBA

### 2.1 Administrador

| Campo | Valor |
|-------|-------|
| **Nombre** | Administrador |
| **Email** | `admin@instituto.edu.co` |
| **Rol** | admin |
| **Estado** | Activo |

> **Nota:** Este usuario tiene acceso completo a todas las funcionalidades, incluyendo configuración del sistema, gestión de usuarios y reportes globales.

---

### 2.2 Asesores (Vendedores)

| # | Nombre | Email | Rol |
|---|--------|-------|-----|
| 1 | María González | `maria.gonzalez@instituto.edu.co` | asesor |
| 2 | Carlos Rodríguez | `carlos.rodriguez@instituto.edu.co` | asesor |
| 3 | Ana Martínez | `ana.martinez@instituto.edu.co` | asesor |
| 4 | Luis Hernández | `luis.hernandez@instituto.edu.co` | asesor |

> **Nota:** Los asesores solo pueden ver y gestionar sus propios estudiantes y prospectos.

---

## 3. CREDENCIALES DE ACCESO

### Sistema de Autenticación Actual

El sistema usa autenticación simplificada basada en email. Para iniciar sesión:

1. Ir a `/auth/login`
2. Ingresar el **email** de cualquier usuario
3. El sistema carga el usuario desde la base de datos

### Emails para Login

```
# Administrador (acceso total)
admin@instituto.edu.co

# Asesores (acceso limitado a sus datos)
maria.gonzalez@instituto.edu.co
carlos.rodriguez@instituto.edu.co
ana.martinez@instituto.edu.co
luis.hernandez@instituto.edu.co
```

---

## 4. PROGRAMAS ACADÉMICOS

| Programa | Valor Total | Matrícula | Módulos | Valor/Módulo |
|----------|-------------|-----------|---------|--------------|
| Técnico en Enfermería | $3,500,000 | $60,000 | 6 | $573,333 |
| Auxiliar en Salud Oral | $2,800,000 | $60,000 | 6 | $456,667 |
| Técnico en Farmacia | $3,200,000 | $60,000 | 6 | $523,333 |
| Auxiliar Administrativo en Salud | $2,500,000 | $50,000 | 6 | $408,333 |
| Técnico en Atención a la Primera Infancia | $2,900,000 | $60,000 | 6 | $473,333 |

---

## 5. ESTUDIANTES DE PRUEBA

| Estudiante | Documento | Programa | Asesor | Estado |
|------------|-----------|----------|--------|--------|
| Laura Sofía Pérez Gómez | 1098765432 | Técnico en Enfermería | María González | Matrícula pagada, Módulo 1 pagado |
| Juan David López Torres | 1087654321 | Auxiliar en Salud Oral | Carlos Rodríguez | Matrícula pagada, Módulo 1 pagado |
| Valentina Ramírez Díaz | 1076543210 | Técnico en Farmacia | Ana Martínez | Matrícula pagada, Módulo 1 pagado |
| Camila Andrea García Ruiz | 1054321098 | Técnico Primera Infancia | María González | Matrícula pagada, Módulo 1 pagado |

---

## 6. PROSPECTOS DE PRUEBA

| Prospecto | Teléfono | Estado | Programa Interesado | Asesor |
|-----------|----------|--------|---------------------|--------|
| Carolina Mendoza Arias | 3023315972 | CONTACTADO | Técnico en Enfermería | María González |
| Pedro José Ramírez Luna | 3023315972 | EN_SEGUIMIENTO | Auxiliar en Salud Oral | Carlos Rodríguez |
| Ana María Quintero Vélez | 3023315972 | EN_SEGUIMIENTO | Técnico en Farmacia | Ana Martínez |

---

## 7. CONFIGURACIÓN DEL SISTEMA

| Clave | Valor | Descripción |
|-------|-------|-------------|
| `MONTHLY_GOAL` | 50,000,000 | Meta de recaudo mensual |

---

## 8. CÓMO EJECUTAR EL SEED

### Requisitos Previos

1. Tener configurada la variable `DATABASE_URL` en `.env`
2. Haber ejecutado `npx prisma db push` para crear las tablas

### Comando

```bash
# Ejecutar el seed
npx prisma db seed

# O alternativamente
npx tsx prisma/seed.ts
```

### Resultado Esperado

```
Reiniciando base de datos...
Creando roles...
Creando usuario administrador...
Creando usuarios (asesores)...
Creando programas...
Creando configuración del sistema...
Creando estudiantes y pagos...
Creando prospectos...
Seed completado exitosamente! 🚀
```

---

## 9. ESTRUCTURA DE DATOS CREADOS

```
Roles (2)
├── admin
└── asesor

Usuarios (5)
├── Administrador (admin)
├── María González (asesor)
├── Carlos Rodríguez (asesor)
├── Ana Martínez (asesor)
└── Luis Hernández (asesor)

Programas (5)
├── Técnico en Enfermería
├── Auxiliar en Salud Oral
├── Técnico en Farmacia
├── Auxiliar Administrativo en Salud
└── Técnico en Atención a la Primera Infancia

Estudiantes (4)
├── Laura Sofía Pérez Gómez
│   ├── Pago: Matrícula ($60,000)
│   ├── Pago: Módulo 1 ($573,333)
│   └── Compromisos: Módulos 1-6
├── Juan David López Torres
│   ├── Pago: Matrícula ($60,000)
│   ├── Pago: Módulo 1 ($456,667)
│   └── Compromisos: Módulos 1-6
├── Valentina Ramírez Díaz
│   ├── Pago: Matrícula ($60,000)
│   ├── Pago: Módulo 1 ($523,333)
│   └── Compromisos: Módulos 1-6
└── Camila Andrea García Ruiz
    ├── Pago: Matrícula ($60,000)
    ├── Pago: Módulo 1 ($473,333)
    └── Compromisos: Módulos 1-6

Prospectos (3)
├── Carolina Mendoza Arias (CONTACTADO)
├── Pedro José Ramírez Luna (EN_SEGUIMIENTO)
└── Ana María Quintero Vélez (EN_SEGUIMIENTO)

Configuración (1)
└── MONTHLY_GOAL: $50,000,000
```

---

## 10. NOTAS IMPORTANTES

### Autenticación
- El sistema actualmente usa autenticación simplificada sin contraseñas
- Para producción, se debe implementar autenticación segura con hashing de contraseñas

### Datos de Prueba
- Todos los teléfonos son ficticios
- Los documentos de identidad son ficticios
- Las fechas de inscripción están en 2024 para simular histórico

### Limpieza
- El seed BORRA todos los datos existentes antes de crear los nuevos
- Usar con precaución en ambientes con datos reales

---

*Última actualización: 2026-01-24*
