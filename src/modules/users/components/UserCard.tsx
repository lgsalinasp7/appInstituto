"use client";

/**
 * User Card Component
 * Displays user information in a card format
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { User } from "../types";

interface UserCardProps {
  user: User;
  onClick?: () => void;
}

export function UserCard({ user, onClick }: UserCardProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <Card
      className={onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg">{user.name || "Sin nombre"}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={user.isActive ? "default" : "secondary"}>
            {user.isActive ? "Activo" : "Inactivo"}
          </Badge>
          <Badge variant="outline">{user.role.name}</Badge>
        </div>
      </CardHeader>
      {user.profile?.bio && (
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {user.profile.bio}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
