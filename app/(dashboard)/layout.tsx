"use client"
import { Navbar } from "@/components/shared/navbar";
import { Sidebar, SidebarProvider, useSidebar } from "@/components/shared/sidebar";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { desktopCollapsed } = useSidebar();

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <div
        className={`flex min-h-screen flex-1 min-w-0 flex-col overflow-hidden transition-[margin] duration-200 ${
          desktopCollapsed ? "md:ml-[72px]" : "md:ml-64"
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </SidebarProvider>
  );
}