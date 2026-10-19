import Link from "next/link";

/**
 * THE button (design standard D0.4). Every clickable action that looks like a
 * button — or like a link-style action — is one of these.
 *
 *  variant  primary   blue fill — the ONE main action in a panel or pop-up
 *           secondary white, grey outline — Cancel, Export, other actions
 *           danger    red fill — destructive confirm (Reject, Revoke, Deactivate)
 *           link      no box, blue 13px Medium — row actions, See all, Clear filters
 *  size     sm 32 · md 36 (default) · lg 44 (sign-in only). `link` ignores size.
 *  tone     "danger" turns a link red (destructive row action).
 *  busy     shows a spinner and blocks clicks (e.g. "Signing in…").
 *
 * States for all: hover 90% · keyboard focus ring · disabled 40%, not clickable.
 */
export type ButtonVariant = "primary" | "secondary" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const box: Record<ButtonSize, string> = {
  sm: "h-control-sm px-3",
  md: "h-control px-4",
  lg: "h-control-xl w-full px-5",
};
const look: Record<ButtonVariant, string> = {
  primary: "rounded-control bg-action text-white hover:bg-action/90",
  secondary: "rounded-control border border-control bg-white text-secondary shadow-hairline hover:bg-page",
  danger: "rounded-control bg-danger text-white hover:bg-danger/90",
  link: "rounded-control text-link hover:underline",
};
const BASE =
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap focus-ring disabled:cursor-not-allowed disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40";

/** The class list for a button look — shared by <Button> and <ButtonLink>. */
export function buttonClass(variant: ButtonVariant = "secondary", size: ButtonSize = "md", tone?: "danger") {
  if (variant === "link") return `${BASE} type-body-strong ${look.link} ${tone === "danger" ? "text-danger" : ""}`;
  return `${BASE} type-button ${box[size]} ${look[variant]}`;
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; tone?: "danger"; busy?: boolean };

export function Button({
  variant = "secondary",
  size = "md",
  tone,
  busy = false,
  className = "",
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & Common) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={`${buttonClass(variant, size, tone)} ${className}`}
    >
      {busy && <Spinner />}
      {children}
    </button>
  );
}

/** A link that looks like a button (e.g. "Open CRED/LIC/23/0044" in a pop-up). */
export function ButtonLink({
  href,
  variant = "secondary",
  size = "md",
  tone,
  className = "",
  children,
}: { href: string; className?: string; children: React.ReactNode } & Omit<Common, "busy">) {
  return (
    <Link href={href} className={`${buttonClass(variant, size, tone)} ${className}`}>
      {children}
    </Link>
  );
}

function Spinner() {
  return <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}
