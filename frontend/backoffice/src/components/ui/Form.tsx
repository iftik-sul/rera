"use client";

import { useId } from "react";

/**
 * Form controls (design standard D0.5). Every text box, tick box and code box
 * in the back office is one of these — never a hand-made <input>.
 *  - 40px high (`size="sm"` 32 for toolbars, `size="lg"` 44 for the sign-in page)
 *  - 8px corners, grey outline; focus turns the outline blue
 *  - an error turns it red and shows the message under the field
 */
type Size = "sm" | "md" | "lg";
const height: Record<Size, string> = { sm: "h-control-sm", md: "h-control-lg", lg: "h-control-xl" };
const frame = (error?: boolean) =>
  `flex items-center gap-2 rounded-control border bg-white px-3 focus-within:border-action ${error ? "border-danger" : "border-control"}`;
const inner = (size: Size) => `min-w-0 flex-1 bg-transparent text-strong outline-none placeholder:text-muted ${size === "lg" ? "type-body-lg" : "type-body"}`;

/** Label + control + hint/error. `required` adds the red *. */
export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="flex gap-0.5 type-label text-strong">
        {label}
        {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="type-caption text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="type-caption text-muted">{hint}</p>
      )}
    </div>
  );
}

export function TextInput({
  size = "md",
  leading,
  trailing,
  error,
  className = "",
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  size?: Size;
  /** Icon or text inside the box, before the text */
  leading?: React.ReactNode;
  /** Icon or button inside the box, after the text */
  trailing?: React.ReactNode;
  error?: boolean;
}) {
  return (
    <span className={`${frame(error)} ${height[size]} ${className}`}>
      {leading}
      <input {...props} className={inner(size)} aria-invalid={error || undefined} />
      {trailing}
    </span>
  );
}

export function TextArea({ rows = 3, error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      rows={rows}
      {...props}
      aria-invalid={error || undefined}
      className={`resize-none rounded-control border bg-white px-3 py-2.5 type-body text-strong outline-none placeholder:text-muted focus:border-action ${error ? "border-danger" : "border-control"}`}
    />
  );
}

/** Digits only, up to `length` (default 6) — the step-up authentication code. */
export function CodeInput({ value, onChange, length = 6, ...props }: { value: string; onChange: (v: string) => void; length?: number } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size">) {
  return (
    <TextInput
      {...props}
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={length}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
    />
  );
}

/** Tick box with its label. */
export function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5 type-body text-strong">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 shrink-0 cursor-pointer accent-action focus-ring" />
      <span>{children}</span>
    </label>
  );
}

/**
 * Choose one of a few options, each with a line of explanation (e.g. which stage an item
 * returns to). Shown as bordered rows; the chosen row takes the action outline.
 */
export function RadioGroup<T extends string>({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: T | null;
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
}) {
  return (
    <div role="radiogroup" className="flex flex-col gap-2">
      {options.map((o) => {
        const chosen = value === o.value;
        return (
          <label
            key={o.value}
            className={`flex cursor-pointer items-start gap-2.5 rounded-control border px-4 py-3 ${chosen ? "border-action" : "border-control"}`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={chosen}
              onChange={() => onChange(o.value)}
              className="mt-0.5 size-4 shrink-0 cursor-pointer accent-action focus-ring"
            />
            <span className="flex flex-col gap-0.5">
              <span className="type-body-strong text-strong">{o.label}</span>
              {o.hint && <span className="type-caption text-muted">{o.hint}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}
