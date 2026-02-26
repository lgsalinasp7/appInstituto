'use client';

/**
 * AdminBreadcrumbs Component
 * Breadcrumb navigation for admin pages
 * Follows glass morphism design system
 */

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Centralized route name mapping
const routeNames: Record<string, string> = {
  '/admin': 'Admin',
  '/admin/empresas': 'Empresas',
  '/admin/suscripciones': 'Suscripciones',
  '/admin/leads': 'Leads',
  '/admin/campanas': 'Campañas',
  '/admin/email-templates': 'Email',
  '/admin/email-templates/new': 'Nueva Plantilla',
  '/admin/email-templates/[id]': 'Editar Plantilla',
  '/admin/agentes-comerciales': 'Agentes Comerciales',
  '/admin/agentes': 'Agentes IA',
  '/admin/agentes-kanban': 'Margy & Kaled',
  '/admin/agentes/referencia': 'Free Tier Reference',
  '/admin/kaled-analytics': 'Analytics',
  '/admin/metricas': 'Métricas',
  '/admin/audit': 'Auditoría',
  '/admin/users': 'Usuarios',
  '/admin/branding': 'Branding',
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: { label: string; href: string }[] = [];

    let currentPath = '';
    paths.forEach((segment) => {
      currentPath += `/${segment}`;

      // Check if it's a dynamic ID (UUID pattern)
      const isId = /^[a-f0-9-]{36}$/i.test(segment);

      let lookupPath = currentPath;
      if (isId) {
        // Replace ID with [id] for lookup
        lookupPath = currentPath.replace(/\/[a-f0-9-]{36}$/i, '/[id]');
      }

      const label = routeNames[lookupPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ label, href: isId ? '#' : currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs if only one level (just /admin)
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm overflow-x-auto scrollbar-hide whitespace-nowrap pb-2 lg:pb-0">
      {breadcrumbs.map((crumb, index) => (
        <div key={`breadcrumb-${index}`} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-slate-600 flex-shrink-0" />
          )}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-white font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-slate-400 hover:text-white transition-colors font-medium"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
