"use client";

import { createContext, useContext } from "react";
import type { Role } from "@/config/roles";

const RoleContext = createContext<Role | null>(null);

/** Makes the current role available to the sidebar and top bar. */
export function RoleProvider({ role, children }: { role: Role; children: React.ReactNode }) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export function useRole(): Role {
  const role = useContext(RoleContext);
  if (!role) throw new Error("useRole must be used inside a role layout");
  return role;
}
