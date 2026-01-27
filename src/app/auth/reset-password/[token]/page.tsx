"use client";

import { useParams } from "next/navigation";
import { ResetPasswordForm } from "@/modules/auth";

export default function ResetPasswordPage() {
    const params = useParams();
    const token = params.token as string;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <ResetPasswordForm token={token} />
            </div>
        </div>
    );
}
