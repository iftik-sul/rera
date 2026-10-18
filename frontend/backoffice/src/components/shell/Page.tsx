"use client";

import Link from "next/link";
import { href } from "@/config/roles";
import { useRole } from "./RoleContext";

type PageProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Override the workspace spacing (default: 24px top/bottom, 32px sides, 24px gaps). */
  bodyClassName?: string;
};
// Note: there is deliberately no "pinned footer". Decision panels sit at the END of the
// content and are never sticky (project-lead decision 2026-09-30; KB application-review.md §6),
// so a weighty decision is never one click away from content the officer hasn't read.

/**
 * One back-office page: the 78px top bar (Figma: Background+HorizontalBorder)
 * plus the Workspace underneath. Only the Workspace scrolls — the top bar and
 * sidebar stay put, exactly like the Figma screens.
 */
export function Page({ title, subtitle, children, bodyClassName = "gap-6 px-8 py-6" }: PageProps) {
  const role = useRole();

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <header className="flex h-[78px] shrink-0 items-center justify-between border-b border-black/10 bg-white px-8">
        <div className="min-w-0">
          <h1 className="text-lg leading-[27px] font-medium text-n900">{title}</h1>
          {subtitle && <p className="text-xs leading-[18px] text-n400">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <Link href={href(role, "notifications")} aria-label="Notifications" className="block size-9">
            <img src="/icons/notification-bell.svg" alt="" className="size-9" />
          </Link>
          <div className="flex items-center gap-2.5 border-l border-n40 pl-3">
            <img src={role.user.avatar} alt="" className="size-8 rounded-full object-cover" />
            <div>
              <p className="text-[13px] leading-5 font-medium whitespace-nowrap text-n900">{role.user.name}</p>
              <p className="text-xs leading-[18px] whitespace-nowrap text-n400">{role.title}</p>
            </div>
          </div>
        </div>
      </header>

      {/*
        [&>*]:shrink-0 — nothing inside the workspace may be squeezed to fit the window.
        Without it, a card taller than the screen gets compressed and crops its own
        bottom (the table's last rows and pagination). With it, the workspace scrolls.

        [scrollbar-gutter:stable] — always keep the scroll bar's space reserved. Otherwise,
        on Windows, the content jumps ~15px sideways whenever the page switches between
        needing a scroll bar and not (e.g. when a filter makes the list short).
      */}
      <main className={`flex min-h-0 flex-1 flex-col overflow-y-auto bg-n20 [scrollbar-gutter:stable] [&>*]:shrink-0 ${bodyClassName}`}>
        {children}
      </main>
    </div>
  );
}
