
import { UsersService } from "@/modules/users/services/users.service";
import { AdminService } from "@/modules/admin/services/admin.service";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  // Fetch users and invitations
  const [{ users }, invitations] = await Promise.all([
    UsersService.getUsers({ limit: 100 }), // Get all users (or first 100 for now)
    AdminService.getInvitations()
  ]);

  return (
    <UsersClient
      initialUsers={users}
      initialInvitations={invitations}
    />
  );
}
