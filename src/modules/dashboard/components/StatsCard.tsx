"use client";

/**
 * Stats Card Component
 * Tarjeta de estadística con diseño institucional
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardCard } from "../types";

interface StatsCardProps {
  card: DashboardCard;
}

export function StatsCard({ card }: StatsCardProps) {
  return (
    <Card className="shadow-instituto card-hover border-0 bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[#64748b]">
          {card.title}
        </CardTitle>
        {card.icon && (
          <span className="text-2xl opacity-80">{card.icon}</span>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-[#1e3a5f]">{card.value}</div>
        {card.description && (
          <p className="text-xs text-[#94a3b8] mt-1">{card.description}</p>
        )}
        {card.trend && (
          <p
            className={`text-xs mt-2 flex items-center gap-1 ${
              card.trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            <span>{card.trend.isPositive ? "↑" : "↓"}</span>
            {Math.abs(card.trend.value)}% desde el mes pasado
          </p>
        )}
      </CardContent>
    </Card>
  );
}
