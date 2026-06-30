"use client"
import { useState } from "react";
import { Navbar } from "@/components/shared/navbar";
import { Sidebar } from "@/components/shared/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex">
      <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />

      <div
        className={`flex min-h-screen flex-1 min-w-0 flex-col overflow-hidden transition-[margin] duration-200 ${collapsed ? "md:ml-[72px]" : "md:ml-64"
          }`}
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
}