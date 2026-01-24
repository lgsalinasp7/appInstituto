"use client";

/**
 * Profile Page
 * User profile management using components from the users module
 */

import { toast } from "sonner";
import { ProfileForm } from "@/modules/users";

interface ProfileFormData {
  bio?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

export default function ProfilePage() {
  async function handleUpdateProfile(data: ProfileFormData) {
    // TODO: Implement actual profile update logic
    console.log("Profile update:", data);
    toast.success("Perfil actualizado correctamente");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Administra tu información personal
        </p>
      </div>

      <ProfileForm onSubmit={handleUpdateProfile} />
    </div>
  );
}
