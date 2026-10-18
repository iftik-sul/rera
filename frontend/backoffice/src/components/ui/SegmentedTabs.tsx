"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Grey pill with white selected tab (Figma "Segmented control"). Each tab is its own page. */
export function SegmentedTabs({ tabs }: { tabs: { label: string; href: string }[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex shrink-0 rounded-lg bg-n40 p-1">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-4 py-2 text-[13px] font-medium whitespace-nowrap ${
              active ? "bg-white text-n900" : "text-n400 hover:text-n900"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
