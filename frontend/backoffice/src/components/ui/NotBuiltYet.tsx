"use client";

import { Page } from "@/components/shell/Page";

/** Temporary stand-in so every sidebar link opens something while screens are being built. */
export function NotBuiltYet({ title }: { title: string }) {
  return (
    <Page title={title}>
      <div className="rounded-card border border-dashed border-control bg-white px-6 py-10 text-center type-body text-muted">
        This screen hasn&apos;t been built yet. It&apos;s coming in a later batch.
      </div>
    </Page>
  );
}
