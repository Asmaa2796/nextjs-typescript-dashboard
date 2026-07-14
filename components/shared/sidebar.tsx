"use client"
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Calendar as Events,
  Settings,
  PlusCircle,
  List,
  ChevronDown,
  PanelLeftOpen,
  PanelRightOpen,
  LogOut,
  Blocks,
  ClipboardClock,
  Menu,
  X,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Image from "next/image";

import { usePathname } from "next/navigation";
import { createContext, useContext, useState, ReactNode } from "react";
import { signOut } from "@/app/actions/auth";

type SidebarContextType = {
  desktopCollapsed: boolean;
  setDesktopCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{ desktopCollapsed, setDesktopCollapsed, mobileOpen, setMobileOpen }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider");
  return ctx;
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { mobileOpen, setMobileOpen } = useSidebar();
  return (
    <button
      type="button"
      onClick={() => setMobileOpen(!mobileOpen)}
      className={`md:hidden cursor-pointer rounded-md p-2 hover:bg-accent dark:hover:bg-[#09161f] transition-colors ${className ?? ""}`}
      aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
    >
      {mobileOpen ? <X size={22} /> : <Menu size={22} />}
    </button>
  );
}

const menuItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    title: "Posts",
    icon: FileText,
    children: [
      { title: "Add Post", href: "/posts/create", icon: PlusCircle },
      { title: "View Posts", href: "/posts", icon: List },
    ],
  },
  { title: "Categories", href: "/categories", icon: Blocks },
  { title: "Events", href: "/events", icon: Events },
  { title: "Audit Logs", href: "/audit-logs", icon: ClipboardClock },
  { title: "Settings", href: "/settings", icon: Settings },
];

function isPostsPath(pathname: string) {
  return pathname.startsWith("/posts");
}

type SidebarContentProps = {
  collapsed: boolean;
  onNavigate?: () => void;
  pathname: string;
  postsOpen: boolean;
  setPostsOpen: (open: boolean) => void;
};

function SidebarContent({
  collapsed,
  onNavigate,
  pathname,
  postsOpen,
  setPostsOpen,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-8 flex items-center justify-between gap-3 px-2">
        <h2 className={`text-xl text-slate-600 font-bold ${collapsed ? "hidden" : "block"}`}>Admin Panel</h2>
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          if (item.children) {
            const isPostsActive = isPostsPath(pathname);
            return (
              <Collapsible key={item.title} open={postsOpen} onOpenChange={setPostsOpen}>
                <CollapsibleTrigger className="w-full cursor-pointer">
                  <span className={`flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 ${isPostsActive ? "bg-sky-100 dark:bg-[#09161f] text-sky-600" : "hover:bg-accent dark:hover:bg-[#09161f] text-slate-700"}`}>
                    <span className="flex items-center gap-3">
                      <Icon size={18} />
                      {!collapsed && <span>{item.title}</span>}
                    </span>
                    {!collapsed && (
                      <ChevronDown size={16} className={`transition-transform ${postsOpen ? "rotate-180" : ""}`} />
                    )}
                  </span>
                </CollapsibleTrigger>

                {!collapsed && (
                  <CollapsibleContent className="ml-6 mt-2 space-y-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive =
                        child.href === "/posts"
                          ? pathname === "/posts" || pathname.startsWith("/posts/show") || pathname.startsWith("/posts/edit")
                          : pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => {
                            onNavigate?.();
                          }}
                          className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm ${isChildActive ? "text-sky-500 dark:bg-[#09161f] bg-slate-50" : "hover:bg-accent dark:hover:bg-[#09161f]"}`}
                        >
                          <ChildIcon size={16} />
                          <span>{child.title}</span>
                        </Link>
                      );
                    })}
                  </CollapsibleContent>
                )}
              </Collapsible>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                setPostsOpen(false);
                onNavigate?.();
              }}
              className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 ${pathname === item.href ? "bg-sky-100 dark:bg-[#09161f] text-sky-600" : "hover:bg-accent dark:hover:bg-[#09161f] text-slate-700"}`}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t mt-4">
        <form action={signOut}>
          <button
            type="submit"
            className={`flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut size={18} />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </form>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { desktopCollapsed, setDesktopCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const [postsOpen, setPostsOpen] = useState(isPostsPath(pathname));

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex fixed left-0 top-0 h-screen flex-col border-r bg-background p-4 dark:bg-gray-950 transition-[width] duration-200 ${desktopCollapsed ? "w-[72px]" : "w-64"}`}>
        <div className="flex items-center justify-between mb-8">
          <div className={`text-xl font-bold ${desktopCollapsed ? "hidden" : "block"}`}>
            <Image src="/assets/dashboard.png" alt="Logo" width={40} height={40} />
          </div>
          <button
            type="button"
            onClick={() => setDesktopCollapsed(!desktopCollapsed)}
            className="rounded-md hover:bg-accent dark:hover:bg-[#09161f] cursor-pointer"
            aria-label={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className="text-sm font-semibold">
              {desktopCollapsed ? <PanelLeftOpen strokeWidth={1} /> : <PanelRightOpen strokeWidth={1} />}
            </span>
          </button>
        </div>

        <SidebarContent
          collapsed={desktopCollapsed}
          pathname={pathname}
          postsOpen={postsOpen}
          setPostsOpen={setPostsOpen}
        />
      </aside>

      <div className="md:hidden">
        <div
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ease-in-out ${
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`fixed left-0 top-0 z-50 h-full w-[280px] border-r bg-background p-4 dark:bg-gray-950 transition-transform duration-300 ease-in-out will-change-transform ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8 flex items-center justify-end">
            {/* <h2 className="text-xl font-bold text-slate-600">Admin Panel</h2> */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="cursor-pointer rounded-md p-2 hover:bg-accent dark:hover:bg-[#09161f]"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>
          <SidebarContent
            collapsed={false}
            onNavigate={() => setMobileOpen(false)}
            pathname={pathname}
            postsOpen={postsOpen}
            setPostsOpen={setPostsOpen}
          />
        </aside>
      </div>
    </>
  );
}