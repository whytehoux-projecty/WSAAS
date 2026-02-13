"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Footer } from "@/components/layout/Footer";
import { MobileInstallPrompt } from "@/components/layout/MobileInstallPrompt";

export default function EBankingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // Don't show layout on auth pages
  if (
    pathname?.includes("/auth/") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/register"
  ) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden relative isolate">
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-[-1] bg-white">
        <Image
          src="/images/login-bg.jpg"
          alt="Dashboard Background"
          fill
          className="object-cover opacity-95"
          priority
        />
      </div>

      <MobileInstallPrompt />

      <LeftSidebar
        isOpen={leftSidebarOpen}
        onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Header
          onToggleRightSidebar={() =>
            setIsRightSidebarOpen(!isRightSidebarOpen)
          }
          isRightSidebarOpen={isRightSidebarOpen}
        />
        <main
          className={cn(
            "flex-1 overflow-y-auto px-4 py-6 md:px-8",
            "transition-all duration-300 ease-in-out",
          )}>
          {children}
        </main>
        <Footer />
      </div>

      <RightSidebar
        isOpen={isRightSidebarOpen}
        onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
      />
    </div>
  );
}
