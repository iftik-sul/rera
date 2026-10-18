/**
 * Back-office roles and their sidebar menus.
 *
 * Every role gets the same shell (sidebar + top bar + scrolling workspace);
 * only this config differs. Adding a role later = adding one entry here
 * plus its pages under src/app/<slug>/.
 */

export type IconName =
  | "eye-tracking"
  | "file-check-02"
  | "user-check-01"
  | "settings-01"
  | "bar-chart-02"
  | "clipboard-check"
  | "bell-01"
  | "help-circle"
  | "log-out";

export type NavItem = {
  label: string;
  /** Path inside the role, e.g. "dashboard" → /director-general/dashboard/ */
  path: string;
  icon: IconName;
  /** Other sections that keep this item highlighted (e.g. Application Review under Work Queue). */
  alsoActiveOn?: string[];
};

export type Role = {
  slug: string;
  title: string;
  /** Sample signed-in user shown in the top bar (static build — no login yet). */
  user: { name: string; avatar: string };
  nav: NavItem[];
};

export const directorGeneral: Role = {
  slug: "director-general",
  title: "Director-General / Registrar",
  user: { name: "Adaeze Nwosu", avatar: "/brand/avatar.png" },
  nav: [
    { label: "Dashboard", path: "dashboard", icon: "eye-tracking" },
    { label: "Work Queue", path: "work-queue/transaction", icon: "file-check-02", alsoActiveOn: ["application-review"] },
    { label: "Practitioner", path: "practitioner-register", icon: "user-check-01" },
    { label: "Sign-off Queue", path: "sign-off-queue", icon: "file-check-02" },
    { label: "Admin Console", path: "admin-console", icon: "settings-01" },
    { label: "Revenue Reports", path: "revenue-reports", icon: "bar-chart-02" },
    { label: "Audit Trail", path: "audit-trail", icon: "clipboard-check" },
    { label: "Notifications", path: "notifications", icon: "bell-01" },
    { label: "Help & Support", path: "help", icon: "help-circle" },
  ],
};

export const roles: Role[] = [directorGeneral];

export const href = (role: Role, path: string) => `/${role.slug}/${path}/`;
