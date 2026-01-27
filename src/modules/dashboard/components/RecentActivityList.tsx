"use client";

/**
 * Recent Activity List Component
 * Lista de actividad reciente con diseño institucional
 */

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RecentActivity } from "../types";

interface RecentActivityListProps {
  activities: RecentActivity[];
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `hace ${minutes} min`;
    if (hours < 24) return `hace ${hours} h`;
    return `hace ${days} días`;
  };

  const getActionColor = (action: string) => {
    if (action.includes("create")) return "bg-green-100 text-green-700";
    if (action.includes("update")) return "bg-blue-100 text-blue-700";
    if (action.includes("delete")) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <Card className="shadow-instituto border-0 bg-white">
      <CardHeader>
        <CardTitle className="text-primary">Actividad Reciente</CardTitle>
        <CardDescription>Últimas acciones en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No hay actividad reciente
            </p>
          ) : (
            activities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Avatar className="h-10 w-10 bg-primary">
                  <AvatarFallback className="bg-primary text-white text-sm">
                    {activity.user?.name?.[0] || activity.user?.email[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {activity.user?.name || activity.user?.email || "Sistema"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {activity.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getActionColor(
                      activity.action
                    )}`}
                  >
                    {activity.action.split(".")[1]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
