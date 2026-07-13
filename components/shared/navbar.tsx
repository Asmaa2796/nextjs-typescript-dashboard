"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Settings, UserCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { SidebarTrigger } from "@/components/shared/sidebar";

export function Navbar() {
  return (
    <header className="h-16 dark:bg-gray-950 border-b px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="font-semibold hidden sm:block text-slate-600">Admin Dashboard</h1>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-md">
          <Settings className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search settings..." aria-label="Search settings" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer">
            <span className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-accent" aria-label="User menu">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background">
                <UserCircle className="h-5 w-5" />
              </span>
              <span className="hidden lg:block text-sm font-medium">Admin</span>
            </span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>
                    <UserCircle className="h-3.5 w-3.5" />
                  </AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <div className="text-sm font-medium">Admin</div>
                  <div className="text-xs text-muted-foreground">Administrator</div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <Link href="/settings" className="flex w-full cursor-pointer items-center">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <form action={signOut} className="w-full">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </form>
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}