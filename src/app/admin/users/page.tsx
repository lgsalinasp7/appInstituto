"use client";

import { UserCard, type User } from "@/modules/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Mock users - replace with actual data from UsersService.getUsers()
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Administrador",
    image: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: { id: "1", name: "admin" },
    profile: { id: "1", bio: "Administrador del sistema", phone: null, address: null, dateOfBirth: null },
  },
  {
    id: "2",
    email: "user@example.com",
    name: "Usuario Test",
    image: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: { id: "2", name: "user" },
    profile: null,
  },
  {
    id: "3",
    email: "inactive@example.com",
    name: "Usuario Inactivo",
    image: null,
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: { id: "2", name: "user" },
    profile: null,
  },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">
            Administra los usuarios del sistema
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input placeholder="Buscar por nombre o email..." className="max-w-sm" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {mockUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onClick={() => console.log("View user:", user.id)}
          />
        ))}
      </div>
    </div>
  );
}
