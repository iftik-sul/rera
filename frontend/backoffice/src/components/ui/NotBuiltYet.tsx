"use client";

import { Page } from "@/components/shell/Page";

/** Temporary stand-in so every sidebar link opens something while screens are being built. */
export function NotBuiltYet({ title }: { title: string }) {
  return (
    <Page title={title}>
      <div className="rounded-xl border border-dashed border-n40 bg-white px-6 py-10 text-center text-[13px] text-n400">
        This screen hasn&apos;t been built yet. It&apos;s coming in a later batch.
      </div>
    </Page>
  );
}
