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
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-n40 bg-white">
      {/* Header — logo + agency name, same 78px height as the top bar */}
      <div className="flex h-[78px] shrink-0 items-center gap-2 border-b border-n40 px-5 py-2">
        <div className="relative h-[60px] w-14 shrink-0 overflow-hidden">
          {/* The Figma logo image is cropped to the crest; these offsets reproduce that crop. */}
          <img
            src="/brand/logo.png"
            alt="Real Estate Regulatory Agency crest"
            className="absolute max-w-none"
            style={{ left: "-47.83%", top: "0.91%", width: "195.65%", height: "98.18%" }}
          />
        </div>
        <p className="font-brand text-sm font-bold tracking-[0.4px] text-n900">Real Estate Regulatory Agency</p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-6">
        {role.nav.map((item) => {
          const target = href(role, item.path);
          const active = pathname === target || pathname.startsWith(target);
          return (
            <Link
              key={item.path}
              href={target}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] leading-5 font-medium transition-colors ${
                active ? "bg-blue-600 text-white" : "text-n400 hover:bg-n20"
              }`}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-n40 px-3 pt-3 pb-5">
        <button
          type="button"
          onClick={() => {
            signOut();
            router.replace("/");
          }}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] leading-5 font-medium text-n400 hover:bg-n20"
        >
          <Icon name="log-out" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
