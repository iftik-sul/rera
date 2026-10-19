"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Grey pill with white selected tab (Figma "Segmented control"). Each tab is its own page. */
export function SegmentedTabs({ tabs }: { tabs: { label: string; href: string }[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex shrink-0 rounded-control bg-control p-1">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-control px-4 py-2 type-body-strong whitespace-nowrap focus-ring ${
              active ? "bg-white text-strong" : "text-muted hover:text-strong"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
