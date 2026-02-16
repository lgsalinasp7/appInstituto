import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Contextos de la aplicación
type AppContext = 'landing' | 'admin' | 'tenant';

export default async function proxy(req: NextRequest) {
    // En Vercel, usar x-forwarded-host como fallback (idéntico a host con dominios custom)
    const rawHost = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
   
    const hostname = rawHost.includes(':') ? rawHost.split(':')[0] : rawHost;
    const pathname = req.nextUrl.pathname;

    // Define your domains
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'kaledsoft.tech';
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Extraer subdomain
    let subdomain = '';
    if (isDevelopment) {
        if (hostname.includes('.localhost')) {
            subdomain = hostname.split('.localhost')[0];
        }
    } else {
        if (hostname.endsWith(`.${rootDomain}`)) {
            subdomain = hostname.replace(`.${rootDomain}`, '');
        }
    }

    // Determinar el contexto
    let context: AppContext = 'landing';
    if (subdomain === 'admin') {
        context = 'admin';
    } else if (subdomain && subdomain !== 'www') {
        context = 'tenant';
    }

    // Crear headers personalizados
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-context', context);

    // CONTEXTO: ADMIN
    if (context === 'admin') {
        // Rutas que no requieren autenticación
        const publicAdminPaths = ['/login', '/forgot-password', '/reset-password', '/api-docs', '/api/openapi'];
        const isPublicPath = publicAdminPaths.some(path => pathname.startsWith(path));

        if (!isPublicPath) {
            // Verificar sesión para rutas protegidas admin
            const sessionToken = req.cookies.get('session_token')?.value;

            if (!sessionToken) {
                // Redirigir a login admin
                return NextResponse.redirect(new URL('/login', req.url));
            }

            // Validar sesión y platformRole (se hace en los handlers de ruta)
            // Aquí solo verificamos que existe la cookie
        }

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // CONTEXTO: TENANT
    if (context === 'tenant') {
        requestHeaders.set('x-tenant-slug', subdomain);

        // NOTA: La validación de existencia y estado del tenant se hace en:
        // 1. API routes: usando withTenantAuth() que valida el tenant
        // 2. Pages: usando getTenantFromHeaders() en los layouts/pages
        // No se hace en middleware porque requiere Prisma (incompatible con Edge Runtime)

        // Rutas públicas del tenant (login, registro, etc.)
        // Incluir /api/auth para que GuestGuard pueda verificar sesión con /api/auth/me (devuelve 401 si no hay sesión)
        const publicTenantPaths = ['/auth', '/login', '/register', '/forgot-password', '/reset-password', '/suspended', '/api-docs', '/api/openapi', '/api/auth'];
        const isPublicPath = publicTenantPaths.some(path => pathname.startsWith(path));

        if (!isPublicPath) {
            // Verificar sesión para rutas protegidas del tenant
            const sessionToken = req.cookies.get('session_token')?.value;

            if (!sessionToken) {
                // Redirigir a login del tenant
                return NextResponse.redirect(new URL('/auth/login', req.url));
            }
        }

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // CONTEXTO: LANDING
    // Landing page pública - no requiere validación
    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

// Run middleware on ALL paths including API routes (needed for multi-tenancy)
export const config = {
    matcher: [
        /*
         * Match all request paths except for static files:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * NOTE: API routes ARE included to support multi-tenancy
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
