"use client";

import { useState } from "react";
import { Page } from "@/components/shell/Page";
import { Card } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import { dgGuides, serviceDesk, systemInfo } from "@/data/director-general/help";

/**
 * Help & Support (KB help-and-support.md): guides for the signed-in role, which expand in place
 * (one open at a time), plus the IT service desk and system information. Nothing here is decided
 * or recorded; one shared screen, only the guide list varies by role.
 */
export function HelpSupport() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Page title="Help & Support" subtitle="Guidance for your role, contacts, and system information.">
      <div className="flex items-start gap-6">
        <Card title="Guides for your role" gap="gap-3" className="min-w-0 flex-1">
          {dgGuides.map((g, i) => {
            const expanded = open === i;
            return (
              <div key={g.title} className={`rounded-control border ${expanded ? "border-action" : "border-control"}`}>
                <div className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="type-body-strong text-strong">{g.title}</p>
                    <p className="type-caption text-muted">{g.summary}</p>
                  </div>
                  <Button variant="link" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : i)}>
                    {expanded ? "Close" : "Read"}
                  </Button>
                </div>
                {expanded && (
                  <div className="flex flex-col gap-3 border-t border-control px-4 py-4">
                    {g.body.map((p) => (
                      <p key={p} className="type-body text-strong">
                        {p}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </Card>

        <div className="flex w-panel shrink-0 flex-col gap-4">
          <Card title="Contact RERA IT Service Desk" gap="gap-3">
            {serviceDesk.map((f) => (
              <Line key={f.label} label={f.label}>
                {f.href ? (
                  <a href={f.href} className="type-body-strong text-link hover:underline focus-ring">
                    {f.value}
                  </a>
                ) : (
                  f.value
                )}
              </Line>
            ))}
          </Card>
          <Card title="System information" gap="gap-3">
            {systemInfo.map((f) => (
              <Line key={f.label} label={f.label}>
                {f.value}
              </Line>
            ))}
          </Card>
        </div>
      </div>
    </Page>
  );
}

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 type-body">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="type-body-strong text-right text-strong">{children}</span>
    </div>
  );
}
