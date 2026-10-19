/**
 * Sample data for the DG Admin Console (Figma "Admin Console", "Account Editor" and the
 * M-ADM pop-ups). The first 10 staff are Figma's; the rest are marked. 20 staff = two
 * full pages (design standard §A5a.0 rule 6a).
 *
 * Rules from the KB (admin-console.md, licensing-categories.md §3–4):
 *  - Nine roles. Role definitions live in the backend; the console only ASSIGNS them.
 *  - Licensing Reviewer / Authorizer must carry at least one category scope.
 *  - The Licensing & Registration Officer (and the DG) cover every category by role.
 *  - One person may not hold the Officer role together with Reviewer or Authorizer.
 */
import type { BadgeTone, Status } from "@/components/ui/Badge";

export const ROLES = [
  "Director-General / Registrar",
  "Compliance & Escrow Auditor",
  "Licensing Reviewer",
  "Licensing Authorizer",
  "Licensing & Registration Officer",
  "Dispute Adjudication Officer",
  "Revenue & Finance Officer",
  "Inspection & Enforcement Officer",
  "State Liaison Coordinator",
] as const;
export type RoleName = (typeof ROLES)[number];

/** Short role tags (KB status-badges.md §3 — "Role tags", all Blue). */
export const ROLE_TAG: Record<RoleName, string> = {
  "Director-General / Registrar": "DG/Registrar",
  "Compliance & Escrow Auditor": "C&E Auditor",
  "Licensing Reviewer": "Licensing Reviewer",
  "Licensing Authorizer": "Licensing Authorizer",
  "Licensing & Registration Officer": "Licensing Officer",
  "Dispute Adjudication Officer": "Dispute Officer",
  "Revenue & Finance Officer": "Revenue & Finance",
  "Inspection & Enforcement Officer": "Inspection Officer",
  "State Liaison Coordinator": "State Liaison",
};

/** Roles that must carry a category scope (an empty scope blocks the assignment). */
export const SCOPED_ROLES: RoleName[] = ["Licensing Reviewer", "Licensing Authorizer"];
/** Roles that cover every licensing category by virtue of the role. */
export const ALL_CATEGORY_ROLES: RoleName[] = ["Licensing & Registration Officer", "Director-General / Registrar"];

export const CATEGORIES = ["Company Licensing & Permits", "Individual Practitioner Credentials", "Institutional Accreditation"] as const;
export type Category = (typeof CATEGORIES)[number];
/** Short words for the directory column — never the category codes. */
export const CATEGORY_SHORT: Record<Category, string> = {
  "Company Licensing & Permits": "Company",
  "Individual Practitioner Credentials": "Practitioner",
  "Institutional Accreditation": "Institutional",
};

export type AccountStatus = "Invited" | "Active" | "Suspended" | "Deactivated";
export const ACCOUNT_STATUS_ORDER: AccountStatus[] = ["Invited", "Active", "Suspended", "Deactivated"];
const STATUS_TONE: Record<AccountStatus, BadgeTone> = { Invited: "info", Active: "success", Suspended: "error", Deactivated: "error" };
export const accountStatus = (s: AccountStatus): Status => ({ label: s, tone: STATUS_TONE[s] });

export type Mfa = "Enrolled" | "Not enrolled";
export const mfaStatus = (m: Mfa): Status => ({ label: m, tone: m === "Enrolled" ? "success" : "warning" });

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  roles: RoleName[];
  /** Only for Reviewer / Authorizer. */
  scope: Category[];
  status: AccountStatus;
  mfa: Mfa;
  /** The signed-in DG's own account. */
  self?: boolean;
  /**
   * Sign-in locked after repeated failed attempts — when it happened. A lock-out is not an account
   * status: the account stays Active and only sign-in is blocked until an administrator unlocks it
   * (open-questions A16, decided 2026-10-19).
   */
  lockedOut?: string;
  /** The officer asked for an MFA reset from the sign-in page — when. Cleared by Reset MFA. */
  mfaRequest?: string;
};

const s = (id: string, name: string, email: string, role: RoleName, status: AccountStatus, mfa: Mfa, scope: Category[] = []): StaffMember => ({
  id, name, email, roles: [role], scope, status, mfa,
});

const [C1, C2, C3] = CATEGORIES;

export const staff: StaffMember[] = [
  { ...s("stf-00101", "Adaeze Nwosu", "a.nwosu@rera.gov.ng", "Director-General / Registrar", "Active", "Enrolled"), self: true },
  s("stf-00112", "Chukwuemeka Obi", "c.obi@rera.gov.ng", "Compliance & Escrow Auditor", "Active", "Enrolled"),
  s("stf-00118", "Funke Adeyemi", "f.adeyemi@rera.gov.ng", "Licensing & Registration Officer", "Active", "Enrolled"),
  s("stf-00124", "Ibrahim Musa", "i.musa@rera.gov.ng", "Licensing Reviewer", "Active", "Enrolled", [C1, C2]),
  s("stf-00127", "Ngozi Eze", "n.eze@rera.gov.ng", "Licensing Authorizer", "Active", "Enrolled", [C1, C2, C3]),
  s("stf-00133", "Tunde Bakare", "t.bakare@rera.gov.ng", "Dispute Adjudication Officer", "Active", "Enrolled"),
  s("stf-00139", "Amaka Okeke", "a.okeke@rera.gov.ng", "Revenue & Finance Officer", "Active", "Enrolled"),
  s("stf-00145", "Yusuf Abdullahi", "y.abdullahi@rera.gov.ng", "Inspection & Enforcement Officer", "Active", "Not enrolled"),
  s("stf-00151", "Blessing Adewale", "b.adewale@rera.gov.ng", "State Liaison Coordinator", "Invited", "Not enrolled"),
  s("stf-00156", "Sunday Okon", "s.okon@rera.gov.ng", "Compliance & Escrow Auditor", "Suspended", "Enrolled"),
  // ── Beyond the Figma frame: sample staff for page 2 ──
  s("stf-00162", "Halima Garba", "h.garba@rera.gov.ng", "Licensing Reviewer", "Active", "Enrolled", [C3]),
  { ...s("stf-00168", "Emeka Nwankwo", "e.nwankwo@rera.gov.ng", "Licensing Authorizer", "Active", "Enrolled", [C3]), lockedOut: "11 Oct 2026, 09:12" },
  s("stf-00174", "Bola Ogunleye", "b.ogunleye@rera.gov.ng", "Compliance & Escrow Auditor", "Active", "Enrolled"),
  s("stf-00180", "Kelechi Onyema", "k.onyema@rera.gov.ng", "Dispute Adjudication Officer", "Active", "Enrolled"),
  s("stf-00186", "Zainab Lawal", "z.lawal@rera.gov.ng", "Revenue & Finance Officer", "Active", "Enrolled"),
  { ...s("stf-00188", "Chidi Okafor", "c.okafor@rera.gov.ng", "Inspection & Enforcement Officer", "Active", "Enrolled"), mfaRequest: "10 Oct 2026, 16:30" },
  s("stf-00193", "Grace Etim", "g.etim@rera.gov.ng", "Licensing Reviewer", "Invited", "Not enrolled", [C2]),
  s("stf-00197", "Musa Danjuma", "m.danjuma@rera.gov.ng", "State Liaison Coordinator", "Active", "Enrolled"),
  s("stf-00142", "Femi Adebayo", "f.adebayo@rera.gov.ng", "Compliance & Escrow Auditor", "Deactivated", "Enrolled"),
  s("stf-00231", "Tolani Bankole", "t.bankole@rera.gov.ng", "Revenue & Finance Officer", "Suspended", "Enrolled"),
];

export const findStaff = (id: string) => staff.find((m) => m.id === id);

/** "Company · Practitioner", "All categories", or "—" — for the directory column. */
export function scopeText(m: Pick<StaffMember, "roles" | "scope">): string {
  if (m.roles.some((r) => ALL_CATEGORY_ROLES.includes(r))) return "All categories";
  if (!m.roles.some((r) => SCOPED_ROLES.includes(r))) return "—";
  if (m.scope.length === CATEGORIES.length) return "All three categories";
  return m.scope.length ? m.scope.map((c) => CATEGORY_SHORT[c]).join(" · ") : "None";
}

/** Why a role/scope combination can't be saved, or null if it can (A-6 §21). */
export function assignmentBlocker(roles: RoleName[], scope: Category[]): "category" | "separation" | null {
  if (roles.includes("Licensing & Registration Officer") && roles.some((r) => SCOPED_ROLES.includes(r))) return "separation";
  if (roles.some((r) => SCOPED_ROLES.includes(r)) && scope.length === 0) return "category";
  return null;
}
