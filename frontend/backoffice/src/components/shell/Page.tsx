"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { href } from "@/config/roles";
import { signOut } from "@/lib/auth";
import { READ_EVENT, loadRead, unreadCount } from "@/lib/notifications";
import { PopoverItem, PopoverList, usePopover } from "@/components/ui/Popover";
import { Icon } from "./Icon";
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
      <header className="flex h-topbar shrink-0 items-center justify-between border-b border-card bg-white px-8">
        <div className="min-w-0">
          <h1 className="type-page-title text-strong">{title}</h1>
          {subtitle && <p className="type-caption text-muted">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <Bell />
          <ProfileMenu />
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
      <main className={`flex min-h-0 flex-1 flex-col overflow-y-auto bg-page [scrollbar-gutter:stable] [&>*]:shrink-0 ${bodyClassName}`}>
        {children}
      </main>
    </div>
  );
}

/** Notification bell (KB shared-ui components.md, Top Bar): opens Notifications; the dot shows while anything is unread. */
function Bell() {
  const role = useRole();
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    const update = () => setUnread(unreadCount(loadRead()));
    update();
    window.addEventListener(READ_EVENT, update);
    return () => window.removeEventListener(READ_EVENT, update);
  }, []);
  return (
    <Link
      href={href(role, "notifications")}
      aria-label={unread ? `Notifications — ${unread} unread` : "Notifications"}
      className="block size-9 rounded-control focus-ring"
    >
      <img src={unread ? "/icons/notification-bell.svg" : "/icons/notification-bell-quiet.svg"} alt="" className="size-9" />
    </Link>
  );
}

/** Profile block: opens name / role / email, then Help & Support and Sign out. No account settings — staff accounts live in the Admin Console. */
function ProfileMenu() {
  const role = useRole();
  const router = useRouter();
  const p = usePopover();
  return (
    <div ref={p.ref} className="relative border-l border-control pl-3">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={p.open}
        onClick={p.toggle}
        className="flex cursor-pointer items-center gap-2.5 rounded-control p-1 text-left hover:bg-page focus-ring"
      >
        <img src={role.user.avatar} alt="" className="size-8 rounded-full object-cover" />
        <span>
          <span className="block type-body-strong whitespace-nowrap text-strong">{role.user.name}</span>
          <span className="block type-caption whitespace-nowrap text-muted">{role.title}</span>
        </span>
      </button>
      {p.open && (
        <PopoverList role="menu" align="right" label="Account">
          <div className="flex flex-col gap-0.5 border-b border-control px-3 pt-2 pb-3">
            <span className="type-body-strong text-strong">{role.user.name}</span>
            <span className="type-caption text-muted">{role.title}</span>
            <span className="type-caption text-muted">{role.user.email}</span>
          </div>
          <PopoverItem role="menuitem" tick={false} onClick={() => { p.close(); router.push(href(role, "help")); }} trailing={<Icon name="help-circle" />}>
            Help &amp; Support
          </PopoverItem>
          <PopoverItem role="menuitem" tick={false} onClick={() => { signOut(); router.replace("/"); }} trailing={<Icon name="log-out" />}>
            Sign out
          </PopoverItem>
        </PopoverList>
      )}
    </div>
  );
}
