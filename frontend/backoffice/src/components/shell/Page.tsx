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
  /** Bar pinned to the bottom of the workspace while it scrolls (e.g. decision buttons). */
  footer?: React.ReactNode;
};

/**
 * One back-office page: the 78px top bar (Figma: Background+HorizontalBorder)
 * plus the Workspace underneath. Only the Workspace scrolls — the top bar and
 * sidebar stay put, exactly like the Figma screens.
 */
export function Page({ title, subtitle, children, bodyClassName = "gap-6 px-8 py-6", footer }: PageProps) {
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

      <main className={`flex min-h-0 flex-1 flex-col overflow-y-auto bg-n20 ${bodyClassName}`}>
        {children}
        {/* Sticky to the very bottom edge; the pb-5 strip covers the workspace padding so nothing shows beneath. */}
        {footer && <div className="sticky -bottom-5 z-10 -mb-5 bg-n20 pt-1 pb-5">{footer}</div>}
      </main>
    </div>
  );
}
