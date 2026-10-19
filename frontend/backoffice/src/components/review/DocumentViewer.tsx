"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal, ReasonField } from "@/components/ui/Modal";
import type { Doc } from "@/data/director-general/applications";

export type DocMark = { kind: "seen" } | { kind: "flagged"; reason: string };

/**
 * Document viewer (KB application-review.md §3): a pop-up over Application Review, never its
 * own screen. Shows one document with Previous / Next; on a review the DG can act on it offers
 * Mark as seen and Flag an issue. Both are the officer's own working marks — not decisions,
 * never sent to the applicant, and they don't change the document's verification badge.
 * DEMO: there are no uploaded files in the static build, so the preview is a drawn page.
 */
export function DocumentViewer({
  docs,
  index,
  onIndex,
  onClose,
  marks,
  onMark,
  canMark,
  reference,
  applicant,
}: {
  docs: Doc[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
  marks: Record<string, DocMark>;
  onMark: (name: string, mark: DocMark) => void;
  canMark: boolean;
  reference: string;
  applicant: string;
}) {
  const [flagging, setFlagging] = useState(false);
  const [reason, setReason] = useState("");
  useEffect(() => {
    setFlagging(false);
    setReason("");
  }, [index]);

  if (index === null) return null;
  const doc = docs[index];
  const mark = marks[doc.name];
  const last = index === docs.length - 1;
  const advance = () => (last ? onClose() : onIndex(index + 1));

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
          {mark && <span className={`type-body-strong ${mark.kind === "seen" ? "text-valid" : "text-ageing"}`}>{mark.kind === "seen" ? "Seen" : "Flagged"}</span>}
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
          <Button onClick={onClose}>Close</Button>
          {canMark && !flagging && (
            <>
              <Button onClick={() => setFlagging(true)}>Flag an issue</Button>
              <Button
                variant="primary"
                onClick={() => {
                  onMark(doc.name, { kind: "seen" });
                  advance();
                }}
              >
                Mark as seen
              </Button>
            </>
          )}
          {canMark && flagging && (
            <Button
              variant="primary"
              disabled={!reason.trim()}
              onClick={() => {
                onMark(doc.name, { kind: "flagged", reason: reason.trim() });
                setFlagging(false);
              }}
            >
              Flag document
            </Button>
          )}
        </>
      }
    >
      <Preview doc={doc} reference={reference} applicant={applicant} />
      {mark?.kind === "flagged" && !flagging && (
        <p className="rounded-control bg-warning-bg px-4 py-3 type-body text-strong">
          <span className="type-body-strong">You flagged this document:</span> {mark.reason}
        </p>
      )}
      {flagging && (
        <ReasonField
          label="What's wrong with this document?"
          placeholder="For example: the name on the certificate doesn't match the applicant."
          hint="A note for you — the applicant isn't told. To ask them for a new document, use Request Info or Return."
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
