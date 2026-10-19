"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/components/shell/RoleContext";
import { showToast, showToastOnNextPage } from "@/components/shell/Toast";
import { href } from "@/config/roles";
import { Button } from "@/components/ui/Button";
import { Card, Notice } from "@/components/ui/Cards";
import { TextArea } from "@/components/ui/Form";
import { Modal, ReasonField } from "@/components/ui/Modal";
import type { Application } from "@/data/director-general/applications";

/**
 * The claim on an item the DG has opened (application-review.md §5b, modals.md §7b):
 *  - ClaimStrip: "Claimed by you …" with Release item (M-QUE-01), and the 30-minute
 *    inactivity lapse (M-QUE-02).
 *  - DraftNote: a part-written note only the claiming officer sees; leaving the page with
 *    unsaved changes in it asks first (M-SYS-04).
 */

const LAPSE_MS = 30 * 60 * 1000;
const draftKey = (id: string) => `reran.draft.${id}`;
const ref = (app: Application) => app.title.split(" — ")[0];
const pool = (app: Application) =>
  app.queue === "licensing"
    ? { name: "Stage 3 pool", who: "another Licensing & Registration Officer" }
    : { name: `${app.queue} queue`, who: "another Compliance & Escrow Auditor" };

function readDraft(id: string): string {
  try {
    return sessionStorage.getItem(draftKey(id)) ?? "";
  } catch {
    return "";
  }
}
function writeDraft(id: string, text: string | null) {
  try {
    if (text) sessionStorage.setItem(draftKey(id), text);
    else sessionStorage.removeItem(draftKey(id));
  } catch {
    /* storage blocked — the draft lives only on this page */
  }
}

export function ClaimStrip({ app }: { app: Application }) {
  const role = useRole();
  const router = useRouter();
  const [open, setOpen] = useState<"release" | "lapsed" | null>(null);
  const [reason, setReason] = useState("");
  const claim = app.claim!;
  const mine = claim.mine !== false;
  const p = pool(app);

  // Claim lapse: 30 minutes without any activity on the page (M-QUE-02).
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restart = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen("lapsed"), LAPSE_MS);
  }, []);
  useEffect(() => {
    if (!mine) return;
    restart();
    const events = ["mousemove", "keydown", "mousedown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, restart, { passive: true }));
    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, restart));
    };
  }, [mine, restart]);

  const toQueue = () => router.push(href(role, `work-queue/${app.queue}`));

  return (
    <>
      <hr className="border-control" />
      <div className="flex items-center justify-between gap-2 type-body">
        <p>
          <span className="type-body-strong text-strong">{claim.held}</span> <span className="text-muted">{claim.detail}</span>
        </p>
        {mine && (
          <Button
            variant="link"
            onClick={() => {
              setReason("");
              setOpen("release");
            }}
          >
            Release item
          </Button>
        )}
      </div>

      <Modal
        open={open === "release"}
        onClose={() => setOpen(null)}
        width={480}
        title="Release this item?"
        description={
          <p>
            {ref(app)} goes back to the {p.name} for {p.who} to pick up. It stays at its current stage, and nothing is recorded against the
            application itself.
          </p>
        }
        actions={
          <>
            <Button onClick={() => setOpen(null)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!reason.trim()}
              onClick={() => {
                writeDraft(app.id, null);
                showToastOnNextPage({ title: "Item released", body: `${ref(app)} is back in the ${p.name}.` });
                toQueue();
              }}
            >
              Release item
            </Button>
          </>
        }
      >
        <Notice>Your draft note on this item is discarded.</Notice>
        <ReasonField label="Why are you releasing it?" placeholder="For example, a conflict of interest or the wrong specialism." value={reason} onChange={setReason} />
      </Modal>

      <Modal
        open={open === "lapsed"}
        onClose={() => setOpen(null)}
        width={480}
        title="Your claim has lapsed"
        description={
          <p>
            There was no activity for 30 minutes, so {ref(app)} went back to the {p.name}. It may now be held by someone else. You can claim it again if
            it&apos;s still free.
          </p>
        }
        actions={
          <>
            <Button onClick={toQueue}>Back to the queue</Button>
            <Button
              variant="primary"
              onClick={() => {
                setOpen(null);
                restart();
                showToast({ title: "Item claimed again", body: `${ref(app)} is claimed by you.` });
              }}
            >
              Claim it again
            </Button>
          </>
        }
      />
    </>
  );
}

export function DraftNote({ app }: { app: Application }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [leaveTo, setLeaveTo] = useState<string | null>(null);
  const dirty = text !== saved;

  useEffect(() => {
    const d = readDraft(app.id);
    setText(d);
    setSaved(d);
  }, [app.id]);

  // Unsaved changes: ask before following any link off the page (M-SYS-04).
  useEffect(() => {
    if (!dirty) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || a.origin !== window.location.origin) return;
      e.preventDefault();
      e.stopPropagation();
      setLeaveTo(a.pathname + a.search);
    };
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    document.addEventListener("click", onClick, true);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [dirty]);

  const save = () => {
    writeDraft(app.id, text);
    setSaved(text);
    const now = new Date();
    setSavedAt(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
  };

  return (
    <Card title="Draft note" gap="gap-3" aside={<span className="type-caption text-muted">{dirty ? "Unsaved changes" : savedAt ? `Saved at ${savedAt}` : saved ? "Saved" : ""}</span>}>
      <TextArea
        aria-label="Draft note"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Notes towards your decision — for example, what you still need to check."
      />
      <div className="flex items-center justify-between gap-4">
        <p className="type-caption text-muted">Only you can see this. It stays with your claim and is discarded if you release the item.</p>
        <Button size="sm" disabled={!dirty} onClick={save}>
          Save draft
        </Button>
      </div>

      <Modal
        open={!!leaveTo}
        onClose={() => setLeaveTo(null)}
        width={480}
        title="Leave without saving your draft?"
        description={<p>Your draft note on {ref(app)} hasn&apos;t been saved. If you leave now, the changes are lost.</p>}
        actions={
          <>
            <Button onClick={() => setLeaveTo(null)}>Stay on this page</Button>
            <Button
              variant="danger"
              onClick={() => {
                const to = leaveTo!;
                setText(saved);
                setLeaveTo(null);
                router.push(to);
              }}
            >
              Leave without saving
            </Button>
          </>
        }
      />
    </Card>
  );
}
