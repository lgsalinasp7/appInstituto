"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLessonPage = pathname?.includes("/lesson/");

  return (
    <main
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden min-h-0",
        isLessonPage ? "p-0" : "px-4 py-5 sm:px-5 sm:py-6 lg:px-6 lg:py-8 pb-28 lg:pb-8"
      )}
    >
      {children}
    </main>
  );
}
