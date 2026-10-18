/**
 * Demo sign-in for the static build. Checks the email/password against
 * src/config/accounts.ts and remembers the signed-in role in the browser.
 * Replaced by real server sign-in when the backend exists — screens that
 * call these functions won't need to change.
 */
import { demoAccounts } from "@/config/accounts";
import { roles, type Role } from "@/config/roles";

const KEY = "reran.session";

async function sha256(text: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Returns the role on success, or null if the email/password don't match. */
export async function signIn(email: string, password: string): Promise<Role | null> {
  const account = demoAccounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!account || (await sha256(password)) !== account.passwordSha256) return null;
  const role = roles.find((r) => r.slug === account.roleSlug) ?? null;
  if (role) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ roleSlug: role.slug, email: account.email }));
    } catch {
      /* storage blocked (private mode) — sign-in still works for this page view */
    }
  }
  return role;
}

/** The role currently signed in, or null. */
export function currentRole(): Role | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { roleSlug } = JSON.parse(raw) as { roleSlug: string };
    return roles.find((r) => r.slug === roleSlug) ?? null;
  } catch {
    return null;
  }
}

export function signOut() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
