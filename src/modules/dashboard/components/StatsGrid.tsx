"use client";

/**
 * Stats Grid Component
 * Displays multiple stats cards in a responsive grid
 */

import { StatsCard } from "./StatsCard";
import type { LegacyDashboardStats } from "../types";

interface StatsGridProps {
  stats: LegacyDashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const cards = [
    {
      title: "Usuarios Totales",
      value: stats.totalUsers,
      description: "Usuarios registrados",
      icon: "👥",
    },
    {
      title: "Usuarios Activos",
      value: stats.activeUsers,
      description: "Cuentas activas",
      icon: "✅",
    },
    {
      title: "Nuevos Hoy",
      value: stats.newUsersToday,
      description: "Registros hoy",
      icon: "📅",
    },
    {
      title: "Este Mes",
      value: stats.newUsersThisMonth,
      description: "Registros del mes",
      icon: "📈",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatsCard key={card.title} card={card} />
      ))}
    </div>
  );
}
