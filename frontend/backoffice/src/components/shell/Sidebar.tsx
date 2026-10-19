"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { href } from "@/config/roles";
import { Icon } from "./Icon";
import { useRole } from "./RoleContext";

/** Back-office sidebar (Figma: RA-Sidebar). 240px, full height, never scrolls. */
export function Sidebar() {
  const role = useRole();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="flex h-full w-sidebar shrink-0 flex-col border-r border-control bg-white">
      {/* Header — logo + agency name, same 78px height as the top bar */}
      <div className="flex h-topbar shrink-0 items-center gap-2 border-b border-control px-5 py-2">
        <div className="relative h-crest w-14 shrink-0 overflow-hidden">
          {/* The Figma logo image is cropped to the crest; these offsets reproduce that crop. */}
          <img
            src="/brand/logo.png"
            alt="Real Estate Regulatory Agency crest"
            className="absolute max-w-none"
            style={{ left: "-47.83%", top: "0.91%", width: "195.65%", height: "98.18%" }}
          />
        </div>
        <p className="type-brand text-strong">Real Estate Regulatory Agency</p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-6">
        {role.nav.map((item) => {
          const target = href(role, item.path);
          // Highlight by section, so Work Queue stays active on its tabs and on Application Review.
          const sections = [item.path.split("/")[0], ...(item.alsoActiveOn ?? [])];
          const active = sections.some((s) => pathname.startsWith(`/${role.slug}/${s}/`));
          return (
            <Link
              key={item.path}
              href={target}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-control px-3 py-2.5 type-body-strong transition-colors ${
                active ? "bg-action text-white" : "text-muted hover:bg-page"
              }`}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-control px-3 pt-3 pb-5">
        <button
          type="button"
          onClick={() => {
            signOut();
            router.replace("/");
          }}
          className="flex w-full cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 text-left type-body-strong text-muted hover:bg-page"
        >
          <Icon name="log-out" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
