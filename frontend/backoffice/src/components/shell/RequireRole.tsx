"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { currentRole } from "@/lib/auth";
import { href, type Role } from "@/config/roles";

/**
 * Guards a role's pages. Not signed in → back to the sign-in page.
 * Signed in as a different role → to that role's own dashboard.
 * Nothing is shown until the check passes, so there's no flash of the wrong screen.
 */
export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const signedIn = currentRole();
    if (!signedIn) router.replace("/");
    else if (signedIn.slug !== role.slug) router.replace(href(signedIn, "dashboard"));
    else setAllowed(true);
  }, [role.slug, router]);

  return allowed ? <>{children}</> : null;
}
