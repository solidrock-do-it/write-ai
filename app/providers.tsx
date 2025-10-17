"use client";

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <main className="light text-foreground bg-background">
        <ToastProvider placement="top-center" toastOffset={68} />
        {children}
      </main>
    </HeroUIProvider>
  );
}
