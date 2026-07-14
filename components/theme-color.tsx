"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export function ThemeColor() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let meta = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement | null;

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }

    meta.content =
      resolvedTheme === "dark"
        ? "#09161f"
        : "#0084d2";
  }, [resolvedTheme]);

  return null;
}