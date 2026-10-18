/**
 * Button (Figma "_Button base").
 *  primary   — blue, the main action (Approve, Send Request)
 *  secondary — white with grey border (Cancel, Return, Export)
 *  danger    — red, destructive (Reject, Overturn, Revoke)
 *  link      — blue text only (Review)
 */
export type ButtonVariant = "primary" | "secondary" | "danger" | "link";

const variants: Record<ButtonVariant, string> = {
  primary: "border border-blue-600 bg-blue-600 text-white hover:bg-blue-600/90",
  secondary: "border border-btn-border bg-white text-btn-text shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-n20",
  danger: "border border-danger bg-danger text-white hover:bg-danger/90",
  link: "text-blue-600 hover:underline",
};

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const box = variant === "link" ? "" : "rounded-lg px-3.5 py-2";
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 text-sm leading-5 font-semibold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40 ${box} ${variants[variant]} ${className}`}
    />
  );
}
