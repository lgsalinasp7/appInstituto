# Implementación: Lavadero Pro

## Resumen

Lavadero Pro es un módulo de gestión de lavaderos de autos integrado como tipo de tenant dentro de la plataforma KaledSoft. Sigue los patrones de `MULTI_TENANCY.md` e `IMPLEMENTACION_PRODUCTOS_AISLAMIENTO.md`.

## Arquitectura

### Roles
- `LAVADERO_ADMIN` - Acceso completo: dashboard, órdenes, clientes, servicios, facturación
- `LAVADERO_SUPERVISOR` - Acceso limitado: dashboard (solo lectura), órdenes (puede avanzar estado)

### Modelos Prisma (6)
| Modelo | Descripción |
|--------|-------------|
| `LavaderoCustomer` | Clientes del lavadero (@@unique phone+tenant) |
| `LavaderoVehicle` | Vehículos con placa única por tenant |
| `LavaderoService` | Catálogo de servicios con precio en COP |
| `LavaderoOrder` | Órdenes con estado Kanban (RECEIVED→WASHING→READY→DELIVERED) |
| `LavaderoOrderService` | Relación M:N con snapshot de precio |
| `LavaderoPayment` | Pagos (CASH, NEQUI, CARD) |

### Enums
- `LavaderoVehicleType`: CAR, SUV, MOTORCYCLE
- `LavaderoOrderStatus`: RECEIVED, WASHING, READY, DELIVERED
- `LavaderoPaymentMethod`: CASH, NEQUI, CARD

## Estructura de archivos

```
src/modules/lavadero/
├── config/
│   ├── lavadero-routes.config.ts    # Rutas por rol
│   └── lavadero-tenant.config.ts    # Branding + servicios default
├── components/
│   ├── LavaderoSidebar.tsx          # Sidebar tema cyan
│   ├── DashboardView.tsx            # Métricas + gráficas
│   ├── OrdersKanbanView.tsx         # Tablero Kanban 4 columnas
│   ├── NewOrderForm.tsx             # Multi-paso: placa → cliente → servicios
│   ├── CustomersView.tsx            # CRUD clientes + búsqueda
│   ├── ServicesCatalogView.tsx      # Catálogo + toggle activo
│   ├── BillingView.tsx              # Pagos del día + resumen
│   ├── OrderDetailModal.tsx         # Detalle de orden
│   ├── PaymentModal.tsx             # Registrar pago
│   └── WhatsAppButton.tsx           # Enlace wa.me
├── services/
│   ├── lavadero-customer.service.ts
│   ├── lavadero-vehicle.service.ts
│   ├── lavadero-service.service.ts
│   ├── lavadero-order.service.ts
│   ├── lavadero-payment.service.ts
│   ├── lavadero-dashboard.service.ts
│   └── lavadero-bootstrap.service.ts
├── schemas/index.ts                 # Zod schemas
├── types/index.ts                   # Re-export Prisma + interfaces
├── utils/whatsapp.ts                # Generadores de mensajes WA
└── index.ts                         # Barrel exports

src/app/api/lavadero/
├── customers/        (GET, POST)
├── customers/[id]/   (GET, PUT, DELETE)
├── vehicles/         (GET, POST)
├── vehicles/[id]/    (GET, PUT, DELETE)
├── services/         (GET, POST)
├── services/[id]/    (PUT, DELETE)
├── orders/           (GET, POST)
├── orders/[id]/      (GET)
├── orders/[id]/status/ (PATCH)
├── payments/         (GET, POST)
├── dashboard/        (GET)
├── dashboard/daily-summary/ (GET)
├── whatsapp/notify-ready/ (POST)
└── manifest/         (GET - PWA)

src/app/(protected)/lavadero/
├── layout.tsx                       # Guard: tenant + LAVADERO_* role
├── page.tsx                         # Redirect por rol
├── admin/
│   ├── page.tsx → redirect dashboard
│   ├── dashboard/page.tsx
│   ├── orders/page.tsx
│   ├── customers/page.tsx
│   ├── services/page.tsx
│   └── billing/page.tsx
└── supervisor/
    ├── page.tsx → redirect orders
    ├── orders/page.tsx (readOnly)
    └── dashboard/page.tsx (readOnly)
```

## Auth wrapper

Se usa `withLavaderoAuth(allowedRoles, handler)` en `src/lib/api-auth.ts`:
- Valida sesión
- Resuelve tenant (slug header o fallback user.tenantId)
- Verifica `platformRole` en `LAVADERO_ROLES`
- Verifica rol específico en `allowedRoles`
- NO verifica slug fijo (cualquier tenant puede ser tipo lavadero)

## Flujo E2E

1. **Admin > Empresas > Productos** → Deploy "Lavadero Pro" con slug personalizado
2. El script bootstrap crea servicios default colombianos
3. Login como LAVADERO_ADMIN → Dashboard con métricas
4. **Crear orden:** Buscar placa → Si no existe, crear cliente+vehículo → Seleccionar servicios → Confirmar
5. **Kanban:** Mover órdenes entre columnas (Recibido → Lavando → Listo → Entregado)
6. **WhatsApp:** Al marcar "Listo", botón para notificar al cliente
7. **Facturación:** Ver pagos del día, registrar pagos parciales o totales
8. **Supervisor:** Acceso limitado a órdenes y dashboard

## PWA

- Manifest dinámico: `GET /api/lavadero/manifest`
- Service Worker: `public/lavadero-sw.js` (cache-first static, network-first pages)

## Patrones reutilizables

Para agregar un nuevo tipo de SaaS como tenant, seguir estos pasos:
1. Agregar enums de roles al `PlatformRole` enum
2. Crear modelos con prefijo + `tenantId` + relaciones
3. Crear `withXxxAuth` en `api-auth.ts`
4. Crear servicios, schemas, types en `src/modules/xxx/`
5. Crear rutas API en `src/app/api/xxx/`
6. Crear layout guard, sidebar, páginas
7. Integrar sidebar en `ProtectedLayoutClient.tsx`
8. Agregar `ProductTemplate` para deploy desde admin
9. Actualizar `invitations/accept` para manejar el nuevo role field
