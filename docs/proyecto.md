DOCUMENTO DE ARQUITECTURA
Plataforma Multi-Tenant con Branding Personalizable

1. Resumen Ejecutivo
KaledSoft es una plataforma SaaS multi-tenant diseñada para comercializar aplicaciones de gestión empresarial en el mercado colombiano. La plataforma permite que cada cliente (tenant) opere con su propia identidad visual completa, accediendo a través de subdominios personalizados bajo el dominio kaledsoft.tech.

Visión del Producto
Landing pública de KaledSoft (vitrina de productos) + Panel administrativo interno + Múltiples aplicaciones SaaS con branding completo por tenant + Checkout con MercadoPago + Cumplimiento DIAN para facturación electrónica.

 Arquitectura Multi-Tenant
2.1 Modelo de Identificación de Tenants
Cada tenant se identifica por subdominio: empresa.kaledsoft.tech. Opcionalmente, el cliente puede configurar un dominio propio en el futuro. El middleware actual ya detecta subdominios correctamente y los inyecta como header x-tenant-slug.
Flujo de Resolución de Tenant
1. Request llega a Vercel → 2. Middleware extrae subdominio del host → 3. Se inyecta x-tenant-slug en headers → 4. Server Components/API routes consultan tenant por slug → 5. Se carga configuración de branding del tenant → 6. Se renderiza la UI con el theme del tenant

2.2 Evaluación de Estrategia de Base de Datos
Esta es una decisión crítica dado que manejas datos contables y facturación electrónica DIAN. A continuación la comparación detallada:

Criterio
DB Compartida (tenant_id)
DB por Tenant (Neon Branch)
Aislamiento de datos
Lógico (riesgo de data leak si falta WHERE)
Físico (imposible acceder datos de otro tenant)
Cumplimiento DIAN
Requiere auditoría extra para demostrar aislamiento
Aislamiento natural, más fácil de certificar
Costo inicial
Bajo (una sola DB)
Medio (una DB por tenant en Neon)
Costo a escala
Bajo-medio
Alto (cada branch consume recursos)
Complejidad migraciones
Una migración, todos los tenants
Migrar cada DB individualmente
Backup/Restore
Complejo (restaurar un tenant sin afectar otros)
Simple (restaurar la DB del tenant)
Performance
Puede degradar con muchos tenants
Aislado, predecible por tenant
Queries cross-tenant
Fácil (JOIN directo)
Complejo (requiere conexión a cada DB)
Onboarding tenant
INSERT en tabla Tenant
Crear branch + seed + config

RECOMENDACIÓN: Enfoque Híbrido
Usar UNA base de datos compartida con tenant_id para la plataforma principal (KaledSoft admin, usuarios, billing, configuración de tenants, branding). Para los datos de negocio de cada tenant (estudiantes, pagos, contabilidad, facturación DIAN), evaluar si los primeros 10-20 clientes pueden vivir en la DB compartida con aislamiento por tenant_id estricto (RLS de PostgreSQL). Cuando un tenant requiera aislamiento físico (por regulación o volumen), migrar a DB dedicada. Esto reduce costos iniciales y complejidad sin cerrar la puerta al aislamiento físico.

Row Level Security (RLS) — Si eliges DB compartida
PostgreSQL soporta RLS nativo. Esto significa que a nivel de base de datos, cada query se filtra automáticamente por tenant_id sin depender de que el código de aplicación incluya el WHERE. Es una capa de seguridad adicional crítica para datos contables:

Crear políticas RLS en cada tabla que tenga tenant_id
Configurar SET app.current_tenant = 'tenant_id' al inicio de cada request
Prisma soporta esto via $executeRawUnsafe o middleware de Prisma
Cada query se filtra automáticamente, imposible acceder datos de otro tenant

3. Sistema de Autenticación
3.1 Arquitectura Actual (Análisis)
Tu implementación actual tiene NextAuth con Credentials provider y un modelo de User vinculado a Tenant. El modelo de Role está por tenant, lo cual es correcto. Sin embargo, hay aspectos que necesitan reestructuración para soportar la visión completa:

Problemas Identificados
Role.name es @unique global: Esto impide que dos tenants tengan un rol llamado 'Asesor'. Debe ser @@unique([name, tenantId]).
No hay separación entre usuarios de plataforma (KaledSoft staff) y usuarios de tenant: Necesitas un SuperAdmin que no pertenezca a ningún tenant.
Program.name es @unique global: Mismo problema. Dos tenants no pueden tener un programa con el mismo nombre.
Student.documentNumber es @unique global: En teoría, un mismo documento podría estar en dos tenants diferentes (si una persona se matricula en dos instituciones).
Payment.receiptNumber es @unique global: Debe ser único por tenant, no global.
El AuthLayout tiene branding hardcoded de EDUTEC: Debe ser dinámico según el tenant.

3.2 Modelo de Usuarios Propuesto
Se propone una jerarquía de tres niveles de usuarios:

Nivel
Tipo de Usuario
Alcance
Ejemplos
Plataforma
SuperAdmin
Todo KaledSoft
Tú y tu equipo técnico
Plataforma
Asesor Comercial
Gestión de ventas/onboarding
Equipo de ventas KaledSoft
Plataforma
Marketing
Contenido y campañas
Equipo marketing KaledSoft
Tenant
Admin Tenant
Todo dentro de su tenant
Dueño de la institución educativa
Tenant
Operador
Operaciones del día a día
Secretaria, coordinador
Tenant
Asesor Tenant
Gestión de prospectos/estudiantes
Asesor de la institución


3.3 Cambios al Schema de Prisma
Los siguientes cambios son necesarios para soportar la arquitectura completa. Se presentan organizados por prioridad:

Cambios Críticos (Fase 1)
Role: Cambiar @unique en name a @@unique([name, tenantId]) para permitir roles duplicados entre tenants
Program: Cambiar @unique en name a @@unique([name, tenantId])
Student: Cambiar @unique en documentNumber a @@unique([documentNumber, tenantId])
Payment: Cambiar @unique en receiptNumber a @@unique([receiptNumber, tenantId])
Receipt: Cambiar @unique en receiptNumber a @@unique([receiptNumber]) o vincular a tenantId
User: Agregar campo platformRole (SUPER_ADMIN, ASESOR_COMERCIAL, MARKETING) para usuarios de plataforma
User: Hacer tenantId opcional (null para usuarios de plataforma)
Tenant: Agregar modelo TenantBranding para almacenar configuración visual

Modelo TenantBranding (Nuevo)
Este modelo almacena toda la configuración visual de cada tenant para personalizar la experiencia completa:

logoUrl: URL del logo principal del tenant
faviconUrl: Favicon personalizado
primaryColor, secondaryColor, accentColor: Paleta de colores
fontFamily: Tipografía principal (Google Fonts o custom)
loginBgImage: Imagen de fondo para la página de login
loginBgGradient: Gradiente CSS alternativo al fondo
footerText: Texto personalizado del footer
customCss: CSS adicional para personalizaciones avanzadas
darkMode: Boolean para habilitar/deshabilitar modo oscuro

Sistema de Branding por Tenant
4.1 Arquitectura de Theming
El sistema de branding debe funcionar en tres capas para lograr personalización completa sin sacrificar mantenibilidad:

Capa
Responsabilidad
Implementación
CSS Variables
Colores, tipografías, espaciados base
Variables CSS inyectadas en :root desde TenantBranding
Componentes Theme-Aware
Componentes que consumen las variables
React Context con TenantThemeProvider
Custom CSS Override
Personalizaciones avanzadas por tenant
Campo customCss inyectado como <style> tag


4.2 Flujo de Carga del Branding
Paso 1: Middleware detecta subdominio y setea x-tenant-slug → 
Paso 2: Layout raíz del tenant consulta TenantBranding desde DB (cacheable con ISR) → 
Paso 3: TenantThemeProvider inyecta CSS variables en :root → 
Paso 4: Componentes usan var(--primary-color), var(--font-family), etc. → 
Paso 5: Custom CSS se inyecta como última capa para overrides específicos

4.3 Página de Login Personalizada
El AuthLayout actual tiene todo hardcoded para EDUTEC. La solución es convertirlo en un componente dinámico que consuma la configuración del tenant:

El logo gigante watermark se reemplaza con el logo del tenant desde TenantBranding.logoUrl
El gradiente de fondo se carga desde TenantBranding.loginBgGradient o loginBgImage
Los círculos decorativos usan los colores del tenant (primaryColor, secondaryColor)
El footer muestra TenantBranding.footerText en lugar de 'EDUTEC - Educamos con Valores'
La URL visible para el usuario sigue siendo edutec.kaledsoft.tech (o su dominio propio)
El usuario NUNCA ve referencia a KaledSoft — toda la experiencia es white-label

EXPERIENCIA WHITE-LABEL
El objetivo es que el cliente de EDUTEC entre a edutec.kaledsoft.tech y vea SU logo, SUS colores, SU tipografía, SU nombre. No debe haber ninguna referencia visual a KaledSoft en la experiencia del tenant. KaledSoft solo es visible en la landing pública y el panel admin interno.


5. Estructura de la Plataforma KaledSoft
5.1 Dominios y Routing
La plataforma opera en tres contextos diferentes según el dominio:

Dominio
Contenido
Acceso
kaledsoft.tech (raíz)
Landing pública + checkout
Público
admin.kaledsoft.tech
Panel admin de KaledSoft
Solo equipo KaledSoft
[tenant].kaledsoft.tech
App del tenant con branding
Usuarios del tenant


5.2 Landing Pública (kaledsoft.tech)
La landing es la vitrina donde se muestran las aplicaciones disponibles. Funciona como un marketplace de productos SaaS:
Hero section con propuesta de valor de KaledSoft
Catálogo de aplicaciones disponibles (Matrículas, Inventario, CRM, etc.)
Cada app tiene su landing individual con features, pricing y demos
Botón de 'Solicitar Demo' o 'Comprar' que inicia el flujo de checkout
Blog/recursos con contenido de valor para SEO
Sección de testimonios y casos de éxito

5.3 Panel Admin (admin.kaledsoft.tech)
Este es el corazón operativo de KaledSoft. Desde aquí tu equipo gestiona todo:

Módulos del Panel Admin
Módulo
Funcionalidad
Usuarios
Gestión de Tenants
CRUD de tenants, activar/suspender, configurar branding
SuperAdmin
Gestión de Usuarios
Usuarios de plataforma + ver usuarios de tenants
SuperAdmin
Onboarding
Flujo de provisionamiento: documentación DIAN, config inicial
Asesor Comercial
Ventas/CRM
Pipeline de prospectos, seguimiento, cierre
Asesor Comercial
Facturación
Facturas electrónicas, integración DIAN, reportes
SuperAdmin
Billing/Suscripciones
Planes, cobros, MercadoPago, mora
SuperAdmin
Productos/Apps
Catálogo de apps, versiones, features por plan
SuperAdmin
Soporte
Tickets de soporte de tenants
Todo el equipo
Analytics
Métricas de uso, MRR, churn, adopción
SuperAdmin, Marketing

