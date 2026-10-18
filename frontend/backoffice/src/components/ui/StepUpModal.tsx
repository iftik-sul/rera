"use client";

import { useEffect, useState } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

/**
 * Step-up re-authentication (Figma "M-SYS-02 Step-up authentication" — "Confirm it's you").
 * Required before the five widest-consequence actions (KB modals.md §9), e.g. authorising a
 * sign-off or overturning a decision.
 *
 * DEMO: any 6 digits are accepted. The real check happens on the server once the backend
 * exists; this pop-up and its wording stay as they are.
 */
export function StepUpModal({
  open,
  action,
  onCancel,
  onConfirmed,
}: {
  open: boolean;
  /** Fills the sentence "{action} is one of five actions that require re-authentication…" */
  action: string;
  onCancel: () => void;
  onConfirmed: () => void;
}) {
  const [code, setCode] = useState("");
  useEffect(() => {
    if (open) setCode("");
  }, [open]);
  const valid = /^\d{6}$/.test(code);

  return (
    <Modal
      open={open}
      onClose={onCancel}
      width={480}
      title="Confirm it's you"
      description={<p>{action} is one of five actions that require re-authentication before they proceed.</p>}
      actions={
        <>
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="primary" disabled={!valid} onClick={onConfirmed}>
            Confirm
          </Button>
        </>
      }
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-n900">Authentication code</span>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="6-digit code from your authenticator app"
          className="rounded-lg border border-n40 bg-white px-3 py-2.5 text-[13px] leading-5 tracking-wide text-n900 outline-none placeholder:tracking-normal placeholder:text-n400 focus:border-blue-600"
        />
      </label>
    </Modal>
  );
}
