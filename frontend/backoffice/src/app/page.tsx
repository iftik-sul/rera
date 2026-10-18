"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, currentRole } from "@/lib/auth";
import { href } from "@/config/roles";

/**
 * Sign-in page. Figma: "Welcome back - Log in" (empty) and
 * "Welcome back - login" (filled) — one page, two states.
 * Differences from Figma, deliberate:
 *  - Email instead of Phone Number (staff sign in with their work email).
 *  - "Don't have an account? Register" removed — staff accounts are created
 *    by invitation from the Director-General, not self-registration.
 *  - An error line for a wrong email/password (not drawn in Figma).
 */
export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Already signed in? Go straight to that role's dashboard.
  useEffect(() => {
    const role = currentRole();
    if (role) router.replace(href(role, "dashboard"));
  }, [router]);

  const filled = email.trim() !== "" && password !== "";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!filled || busy) return;
    setBusy(true);
    setError("");
    const role = await signIn(email, password);
    if (role) router.replace(href(role, "dashboard"));
    else {
      setError("The email or password you entered is incorrect.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-blue">
      {/* Top bar */}
      <header className="flex justify-center bg-white">
        <div className="flex h-16 w-full max-w-[1280px] items-center justify-between px-10">
          <div className="flex items-center gap-2">
            <div className="relative h-[60px] w-14 shrink-0 overflow-hidden">
              <img
                src="/brand/logo.png"
                alt="Real Estate Regulatory Agency crest"
                className="absolute max-w-none"
                style={{ left: "-47.83%", top: "0.91%", width: "195.65%", height: "98.18%" }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-brand text-base leading-[22.5px] font-bold tracking-[0.375px] text-n900">
                Real Estate Regulatory Agency
              </p>
              <p className="font-brand text-xs leading-[14.67px] text-n400">Federal Republic of Nigeria</p>
            </div>
          </div>
          <p className="font-brand text-[13px] leading-[18.57px] text-n900">
            Need help? <span className="ml-3 font-semibold text-blue-500">Contact Support</span>
          </p>
        </div>
      </header>

      {/* Form */}
      <main className="flex flex-1 justify-center border border-n20 px-4 pt-[139px] pb-16">
        <div className="flex w-full max-w-[640px] flex-col items-center gap-5">
          <form
            onSubmit={onSubmit}
            className="flex w-full flex-col gap-6 rounded-3xl border border-n40 bg-white px-[33px] py-[25px]"
          >
            <div className="flex flex-col gap-1 text-center">
              <h1 className="text-2xl font-semibold tracking-[-0.96px] text-n900">Welcome Back</h1>
              <p className="text-sm leading-5 text-n400">Sign in to your RERA Portal account.</p>
            </div>

            <div className="flex flex-col gap-5">
              <Field label="Email Address" htmlFor="email">
                <img src="/icons/mail.svg" alt="" className="size-4 shrink-0" />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm leading-5 text-n900 outline-none placeholder:text-n400"
                />
              </Field>

              <div className="flex flex-col gap-1.5">
                <Field label="Password" htmlFor="password">
                  <img src="/icons/lock.svg" alt="" className="size-4 shrink-0" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm leading-5 text-n900 outline-none placeholder:text-n400"
                  />
                  {password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="shrink-0 cursor-pointer"
                    >
                      <img src="/icons/eye.svg" alt="" className="size-4" />
                    </button>
                  )}
                </Field>
                <p className="text-[13px] leading-5 text-blue-600">Forgot password</p>
              </div>
            </div>

            {error && (
              <p role="alert" className="-mt-2 text-[13px] leading-5 text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!filled || busy}
              className={`flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-blue-600 px-5 py-2.5 text-base leading-6 font-medium text-white ${
                filled ? "cursor-pointer hover:bg-blue-600/90" : "opacity-30"
              }`}
            >
              {filled ? (
                <>
                  <img src="/icons/check-circle.svg" alt="" className="size-4" />
                  Log in
                </>
              ) : (
                <>
                  Continue
                  <img src="/icons/arrow-right.svg" alt="" className="size-6" />
                </>
              )}
            </button>
          </form>

          <p className="w-[352px] px-[15px] text-center text-xs leading-[18px] text-[#64748b]">
            By continuing, you agree to the Portal <span className="text-blue-600">Terms of Service</span> and{" "}
            <span className="text-blue-600">Privacy Policy</span>.
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="flex gap-0.5 text-sm leading-5 font-medium">
        <span className="text-n900">{label}</span>
        <span className="text-red-600">*</span>
      </label>
      <div className="flex items-center gap-2 rounded-lg border border-n40 bg-white px-[13px] py-[11px] focus-within:border-blue-600">
        {children}
      </div>
    </div>
  );
}
