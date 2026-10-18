"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, Timer, TrendingUp, CalendarCheck, Settings,
  Moon, Sun, Smartphone, Monitor, Sparkles,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import QuickLogModal from "@/components/QuickLogModal";
import type { ViewMode } from "@/types";

const NAV = [
  { href: "/", label: "ホーム", icon: LayoutDashboard },
  { href: "/log", label: "記録", icon: Timer },
  { href: "/analysis", label: "分析", icon: TrendingUp },
  { href: "/plan", label: "計画", icon: CalendarCheck },
  { href: "/settings", label: "設定", icon: Settings },
] as const;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);

  useEffect(() => setMounted(true), []);

  const desktopMode = mounted && viewMode === "desktop";

  const viewToggle = (
    <div className="flex items-center rounded-full border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900" role="tablist" aria-label="表示モード切替">
      {([
        { v: "mobile" as ViewMode, icon: Smartphone, label: "スマホ版" },
        { v: "desktop" as ViewMode, icon: Monitor, label: "PC版" },
      ]).map(({ v, icon: Icon, label }) => {
        const active = mounted && viewMode === v;
        return (
          <button
            key={v}
            role="tab"
            aria-selected={active}
            title={label}
            onClick={() => setViewMode(v)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              active
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );

  const themeToggle = (
    <button
      aria-label="テーマ切替"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition-colors hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-indigo-400"
    >
      {mounted && resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );

  const content = (
    <>
      <main className="flex-1 pb-24 md:pb-10">{children}</main>

      {/* スマホ：ボトムナビ */}
      <nav className="glass fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 dark:border-slate-800 md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-1.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <a
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition-colors ${
                  active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                {label}
              </a>
            );
          })}
        </div>
      </nav>

      {/* FAB（クイック記録） */}
      <button
        onClick={() => setLogOpen(true)}
        aria-label="クイック学習記録"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-600/40 transition-transform active:scale-95 md:bottom-6 md:right-6"
      >
        <Sparkles size={22} />
      </button>
      <QuickLogModal open={logOpen} onClose={() => setLogOpen(false)} />
    </>
  );

  // PC版フォース：サイドバーダッシュボード
  if (desktopMode) {
    return (
      <div className="flex min-h-dvh">
        <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 px-5 py-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white">
              <Sparkles size={18} />
            </div>
            <span className="text-lg font-extrabold tracking-tight">StudyFlow</span>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <a
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                      : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </a>
              );
            })}
          </nav>
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-4 dark:border-slate-800">
            {viewToggle}
            {themeToggle}
          </div>
        </aside>
        <div className="ml-60 flex-1">{content}</div>
      </div>
    );
  }

  // スマホ版（または auto のモバイル幅）
  return (
    <div className="min-h-dvh md:px-4 md:py-6">
      <div
        className={`pc-frame flex flex-col ${resolvedTheme === "dark" ? "" : "pc-frame-light"} mx-auto flex min-h-[calc(100dvh-3rem)] flex-col`}
      >
        <header className="glass sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 px-4 py-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white">
              <Sparkles size={15} />
            </div>
            <span className="text-base font-extrabold tracking-tight">StudyFlow</span>
          </div>
          <div className="flex items-center gap-2">
            {viewToggle}
            {themeToggle}
          </div>
        </header>
        {content}
      </div>
    </div>
  );
}
