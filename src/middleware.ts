import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const hostname = req.headers.get('host') || '';
    const pathname = req.nextUrl.pathname;

    // Define your domains
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'kaledsoft.tech';
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Handle local development subdomains (e.g., edutec.localhost:3000)
    let subdomain = '';
    if (isDevelopment) {
        if (hostname.includes('.localhost:')) {
            subdomain = hostname.split('.localhost:')[0];
        }
    } else {
        if (hostname.endsWith(`.${rootDomain}`)) {
            subdomain = hostname.replace(`.${rootDomain}`, '');
        }
    }

    // If we have a subdomain and it's not 'www', treat it as a tenant
    if (subdomain && subdomain !== 'www') {
        // Add the tenant subdomain to a custom header for use in Server actions/API
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('x-tenant-slug', subdomain);

        // Continue with the modified headers
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    return NextResponse.next();
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
