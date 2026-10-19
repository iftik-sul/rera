"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { recallList } from "@/lib/listMemory";

/** A breadcrumb step back to a list: returns to the page and filters the officer left (lib/listMemory.ts). */
export function CrumbLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [to, setTo] = useState(href);
  useEffect(() => setTo(recallList(href)), [href]);
  return (
    <Link href={to} className="type-body-strong text-link hover:underline">
      {children}
    </Link>
  );
}
