"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal, ReasonField } from "@/components/ui/Modal";
import type { Doc } from "@/data/director-general/applications";

/** The reviewing officer's verdict on one document, made this session (KB application-review.md §3). */
export type DocVerdict = { status: "Verified" | "Rejected" | "Pending"; reason?: string; at?: string };

const now = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

/**
 * Document viewer (KB application-review.md §3): a pop-up over Application Review, never its
 * own screen. Shows one document with Previous / Next. On a review the DG can act on, a Pending
 * document offers Verify (sets Verified, moves to the next) and Reject document (reason
 * required); a document already verified or rejected offers Undo (back to Pending) until the
 * application is decided. The verdict is the document's status badge (status-badges.md §5);
 * the applicant isn't told per document — they hear the decision on the whole application.
 * A read-only review opens the viewer to read only.
 * DEMO: there are no uploaded files in the static build, so the preview is a drawn page.
 */
export function DocumentViewer({
  docs,
  index,
  onIndex,
  onClose,
  verdicts,
  onVerdict,
  canAct,
  reference,
  applicant,
}: {
  /** Documents with their current status (the officer's verdict already applied). */
  docs: Doc[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
  verdicts: Record<string, DocVerdict>;
  onVerdict: (name: string, verdict: DocVerdict) => void;
  canAct: boolean;
  reference: string;
  applicant: string;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  useEffect(() => {
    setRejecting(false);
    setReason("");
  }, [index]);

  if (index === null) return null;
  const doc = docs[index];
  const mine = verdicts[doc.name];
  const status = doc.status.label;
  const last = index === docs.length - 1;

  return (
    <Modal
      open
      onClose={onClose}
      width={880}
      title={doc.name}
      description={
        <div className="flex items-center gap-3">
          <span>
            {doc.type} · uploaded {doc.uploaded}
          </span>
          <StatusBadge status={doc.status} />
          <span className="flex-1" />
          <span>
            {index + 1} of {docs.length}
          </span>
        </div>
      }
      actions={
        <>
          <Button disabled={index === 0} onClick={() => onIndex(index - 1)}>
            Previous
          </Button>
          <Button disabled={last} onClick={() => onIndex(index + 1)}>
            Next
          </Button>
          <span className="flex-1" />
          {rejecting ? (
            <>
              <Button onClick={() => setRejecting(false)}>Cancel</Button>
              <Button
                variant="danger"
                disabled={!reason.trim()}
                onClick={() => {
                  onVerdict(doc.name, { status: "Rejected", reason: reason.trim(), at: now() });
                  setRejecting(false);
                }}
              >
                Reject document
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onClose}>Close</Button>
              {canAct && status === "Pending" && (
                <>
                  <Button onClick={() => setRejecting(true)}>Reject document</Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      onVerdict(doc.name, { status: "Verified", at: now() });
                      if (last) onClose();
                      else onIndex(index + 1);
                    }}
                  >
                    Verify
                  </Button>
                </>
              )}
              {canAct && status !== "Pending" && <Button onClick={() => onVerdict(doc.name, { status: "Pending" })}>Undo</Button>}
            </>
          )}
        </>
      }
    >
      <Preview doc={doc} reference={reference} applicant={applicant} />
      {!rejecting && mine?.status === "Rejected" && (
        <p className="rounded-control bg-error-bg px-4 py-3 type-body text-strong">
          <span className="type-body-strong">Rejected by you · {mine.at}</span> — {mine.reason}
        </p>
      )}
      {!rejecting && mine?.status === "Verified" && (
        <p className="rounded-control bg-success-bg px-4 py-3 type-body-strong text-strong">Verified by you · {mine.at}</p>
      )}
      {rejecting && (
        <ReasonField
          label="Why are you rejecting this document?"
          placeholder="For example: the name on the certificate doesn't match the applicant."
          hint="Recorded in the audit trail. The applicant isn't told about single documents — to ask them for a replacement, use Request additional information or Return."
          value={reason}
          onChange={setReason}
        />
      )}
    </Modal>
  );
}

/** A drawn stand-in for the uploaded file: a page for a PDF, an ID card for an image. */
function Preview({ doc, reference, applicant }: { doc: Doc; reference: string; applicant: string }) {
  const lines = ["w-full", "w-11/12", "w-full", "w-5/6", "w-full", "w-2/3", "w-full", "w-3/4"];
  return (
    <div className="flex h-panel justify-center overflow-y-auto rounded-card bg-page p-6" aria-label={`Preview of ${doc.name}`}>
      {doc.type === "Image" ? (
        <div className="flex h-fit w-96 gap-4 rounded-card border border-control bg-white p-5 shadow-hairline">
          <div className="size-20 shrink-0 rounded-control bg-control" />
          <div className="flex flex-1 flex-col gap-2">
            <p className="type-label text-muted">FEDERAL REPUBLIC OF NIGERIA</p>
            <p className="type-body-strong text-strong">{applicant}</p>
            <span className="h-2 w-3/4 rounded-full bg-control" />
            <span className="h-2 w-1/2 rounded-full bg-control" />
          </div>
        </div>
      ) : (
        <div className="flex h-fit w-full max-w-160 flex-col gap-3 rounded-control bg-white p-8 shadow-hairline">
          <p className="type-section-title text-strong">{doc.name}</p>
          <p className="type-caption text-muted">
            Submitted with {reference} by {applicant}
          </p>
          {lines.map((w, i) => (
            <span key={i} className={`h-2 rounded-full bg-control ${w}`} />
          ))}
          <span className="h-2 w-1/3 rounded-full bg-control" />
          <p className="pt-4 type-caption text-muted">Page 1 of {doc.name.length % 3 + 1}</p>
        </div>
      )}
    </div>
  );
}
