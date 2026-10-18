"use client";

import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // クライアント側でのみ再ハイドレート（SSRプリレンダでは実行しない）
    useAppStore.persist.rehydrate();
  }, []);

  return <ThemeProvider attribute="class">{children}</ThemeProvider>;
}
