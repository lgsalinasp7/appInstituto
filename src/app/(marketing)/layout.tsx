"use client";

import { BaseLayout } from "@/components/marketing/v2/BaseLayout";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <BaseLayout>
            {children}
        </BaseLayout>
    );
}
