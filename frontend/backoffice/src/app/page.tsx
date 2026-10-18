import Link from "next/link";
import { roles, href } from "@/config/roles";

/**
 * Start page for the static build. There is no login yet, so this lists the
 * roles whose screens exist; pick one to open its dashboard.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <div className="flex items-center gap-3">
        <div className="relative h-[60px] w-14 shrink-0 overflow-hidden">
          <img src="/brand/logo.png" alt="" className="absolute max-w-none" style={{ left: "-47.83%", top: "0.91%", width: "195.65%", height: "98.18%" }} />
        </div>
        <div>
          <p className="font-brand text-sm font-bold tracking-[0.4px] text-n900">Real Estate Regulatory Agency</p>
          <p className="text-xs text-n400">Back office — static preview</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-xl border border-n30 bg-white p-4">
        <p className="px-2 pb-1 text-xs font-medium text-n400 uppercase">Open as</p>
        {roles.map((r) => (
          <Link key={r.slug} href={href(r, "dashboard")} className="rounded-lg px-3 py-2.5 text-[13px] font-medium text-n900 hover:bg-n20">
            {r.title}
          </Link>
        ))}
      </div>
    </main>
  );
}
