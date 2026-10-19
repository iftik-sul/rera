"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, currentRole } from "@/lib/auth";
import { href } from "@/config/roles";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Form";

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
    <div className="flex min-h-screen flex-col bg-signin">
      {/* Top bar */}
      <header className="flex justify-center bg-white">
        <div className="flex h-16 w-full max-w-7xl items-center justify-between px-10">
          <div className="flex items-center gap-2">
            <div className="relative h-crest w-14 shrink-0 overflow-hidden">
              <img
                src="/brand/logo.png"
                alt="Real Estate Regulatory Agency crest"
                className="absolute max-w-none"
                style={{ left: "-47.83%", top: "0.91%", width: "195.65%", height: "98.18%" }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="type-brand-lg text-strong">
                Real Estate Regulatory Agency
              </p>
              <p className="type-brand-sub text-muted">Federal Republic of Nigeria</p>
            </div>
          </div>
          <p className="type-body text-strong">
            Need help? <span className="ml-3 type-group-title text-link">Contact Support</span>
          </p>
        </div>
      </header>

      {/* Form */}
      <main className="flex flex-1 justify-center border border-page px-4 pt-34 pb-16">
        <div className="flex w-full max-w-160 flex-col items-center gap-5">
          <form
            onSubmit={onSubmit}
            className="flex w-full flex-col gap-6 rounded-signin border border-control bg-white px-8 py-6"
          >
            <div className="flex flex-col gap-1 text-center">
              <h1 className="type-display text-strong">Welcome back</h1>
              <p className="type-body-lg text-muted">Sign in to your RERA Portal account.</p>
            </div>

            <div className="flex flex-col gap-5">
              <Field label="Email address" htmlFor="email" required>
                <TextInput
                  id="email"
                  size="lg"
                  type="email"
                  autoComplete="username"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leading={<img src="/icons/mail.svg" alt="" className="size-4 shrink-0" />}
                />
              </Field>

              <div className="flex flex-col gap-1.5">
                <Field label="Password" htmlFor="password" required>
                  <TextInput
                    id="password"
                    size="lg"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leading={<img src="/icons/lock.svg" alt="" className="size-4 shrink-0" />}
                    trailing={
                      password && (
                        <Button variant="link" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                          <img src="/icons/eye.svg" alt="" className="size-4" />
                        </Button>
                      )
                    }
                  />
                </Field>
                <p className="type-body text-link">Forgot password</p>
              </div>
            </div>

            {error && (
              <p role="alert" className="-mt-2 type-body text-danger">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" size="lg" disabled={!filled} busy={busy}>
              {busy ? (
                "Signing in…"
              ) : filled ? (
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
            </Button>
          </form>

          <p className="w-88 px-4 text-center type-caption text-muted">
            By continuing, you agree to the Portal <span className="text-link">Terms of Service</span> and{" "}
            <span className="text-link">Privacy Policy</span>.
          </p>
        </div>
      </main>
    </div>
  );
}
