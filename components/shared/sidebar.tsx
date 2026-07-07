"use client"
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Users,
  Calendar as Events,
  Settings,
  PlusCircle,
  List,
  ChevronDown,
  PanelLeftOpen,
  PanelRightOpen,
  LogOut,
  LayoutList
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Image from "next/image";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/actions/auth";

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
  { title: "Categories", href: "/categories", icon: LayoutList },
  { title: "Events", href: "/events", icon: Events },
  { title: "Users", href: "/users", icon: Users },
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

      {/* Nav items */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          if (item.children) {
            const isPostsActive = isPostsPath(pathname);
            return (
              <Collapsible key={item.title} open={postsOpen} onOpenChange={setPostsOpen}>
                <CollapsibleTrigger className="w-full">
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
                          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${isChildActive ? "text-sky-500 dark:bg-[#09161f] bg-slate-50" : "hover:bg-accent dark:hover:bg-[#09161f]"}`}
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
              className={`flex items-center gap-3 rounded-md px-3 py-2 ${pathname === item.href ? "bg-sky-100 dark:bg-[#09161f] text-sky-600" : "hover:bg-accent dark:hover:bg-[#09161f] text-slate-700"}`}
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

type SidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (val: boolean) => void;
};

export function Sidebar({ collapsed: desktopCollapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const [postsOpen, setPostsOpen] = useState(isPostsPath(pathname));
  const [mobileOpen, setMobileOpen] = useState(false);

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
            onClick={() => onCollapsedChange(!desktopCollapsed)}
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

      {/* Mobile sidebar */}
      <div className="md:hidden">
        <div className="fixed left-4 top-4 z-50">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-md border bg-background p-2 shadow-sm"
            aria-label="Open sidebar"
          >
            ☰
          </button>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <aside className="relative h-full w-[280px] border-r bg-background p-4 dark:bg-gray-950">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-600">Admin Panel</h2>
                <button type="button" onClick={() => setMobileOpen(false)} className="rounded-md p-2 hover:bg-accent dark:hover:bg-[#09161f]" aria-label="Close sidebar">✕</button>
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
        )}
      </div>
    </>
  );
}
