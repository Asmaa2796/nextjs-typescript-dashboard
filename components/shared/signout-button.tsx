"use client";

import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button
        type="submit"
        variant="ghost"
        className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
      >
        <LogOutIcon size={18} />
        <span>Sign out</span>
      </Button>
    </form>
  );
}
