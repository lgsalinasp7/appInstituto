# App Instituto

Sistema de gestión institucional modular construido con Next.js, Tailwind CSS, shadcn/ui, Prisma y Neon.

## Tecnologías

- **Next.js 16** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos utilitarios
- **shadcn/ui** - Componentes UI accesibles
- **Prisma** - ORM para base de datos
- **Neon** - PostgreSQL serverless
- **Zod** - Validación de esquemas

## Estructura del Proyecto

```
src/
├── app/                    # Rutas de Next.js (App Router)
│   ├── (protected)/        # Rutas protegidas (requieren auth)
│   │   ├── dashboard/
│   │   └── profile/
│   ├── admin/              # Panel de administración
│   │   ├── audit/
│   │   ├── roles/
│   │   └── users/
│   └── auth/               # Autenticación
│       ├── login/
│       └── register/
│
├── components/             # Componentes compartidos
│   ├── shared/             # Componentes de layout
│   └── ui/                 # Componentes shadcn/ui
│
├── lib/                    # Utilidades y configuración
│   ├── api.ts              # Helpers para API
│   ├── constants.ts        # Constantes de la app
│   ├── prisma.ts           # Cliente Prisma
│   └── utils.ts            # Utilidades generales
│
└── modules/                # Módulos de negocio
    ├── auth/               # Autenticación
    │   ├── components/
    │   ├── schemas/
    │   ├── services/
    │   └── types/
    ├── users/              # Gestión de usuarios
    │   ├── components/
    │   ├── schemas/
    │   ├── services/
    │   └── types/
    ├── dashboard/          # Dashboard
    │   ├── components/
    │   ├── services/
    │   └── types/
    └── admin/              # Administración
        ├── components/
        ├── schemas/
        ├── services/
        └── types/

prisma/
└── schema.prisma           # Esquema de base de datos
```

## Arquitectura Modular

Cada módulo sigue esta estructura:

- **components/**: Componentes React específicos del módulo
- **services/**: Lógica de negocio y acceso a datos
- **schemas/**: Validaciones Zod
- **types/**: Interfaces TypeScript

Los módulos exportan todo desde su `index.ts`, permitiendo imports limpios:

```typescript
import { LoginForm, AuthService, loginSchema } from "@/modules/auth";
```

## Configuración

### 1. Variables de entorno

Crea un archivo `.env` con:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@host.neon.tech/neondb?sslmode=require"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Auth Secret (genera con: openssl rand -base64 32)
AUTH_SECRET="tu-secreto-aqui"
```

### 2. Base de datos

```bash
# Generar cliente Prisma
npm run db:generate

# Aplicar esquema a la base de datos
npm run db:push

# Abrir Prisma Studio
npm run db:studio
```

### 3. Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run start` | Inicia servidor de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run db:generate` | Genera cliente Prisma |
| `npm run db:push` | Sincroniza esquema con BD |
| `npm run db:studio` | Abre Prisma Studio |

## Deploy en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Vercel detectará automáticamente Next.js

## Agregar Nuevos Módulos

Para agregar un nuevo módulo:

1. Crea la carpeta en `src/modules/[nombre-modulo]/`
2. Agrega subcarpetas: `components/`, `services/`, `types/`, `schemas/`
3. Crea el `index.ts` exportando todo
4. Agrega las rutas correspondientes en `src/app/`

Ejemplo de estructura para un módulo "products":

```
src/modules/products/
├── components/
│   ├── ProductCard.tsx
│   ├── ProductList.tsx
│   └── index.ts
├── services/
│   └── products.service.ts
├── schemas/
│   └── index.ts
├── types/
│   └── index.ts
└── index.ts
```

## Licencia

MIT
