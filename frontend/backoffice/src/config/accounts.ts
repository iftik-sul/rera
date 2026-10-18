/**
 * DEMO sign-in accounts — one per back-office role.
 *
 * This is NOT real security. The site is static (no server), so this list
 * ships inside the website. Passwords are stored as SHA-256 hashes so they
 * aren't readable at a glance, but anyone technical could still get past
 * this. That's acceptable only because the site holds sample data.
 *
 * When the backend exists, sign-in moves to the server (with the MFA the
 * spec requires for Regulatory Authority staff) and this file is deleted.
 *
 * To add a role: add its entry in roles.ts, then one account here.
 * Hash a password with:  echo -n 'thepassword' | sha256sum
 */

export type DemoAccount = {
  email: string;
  passwordSha256: string;
  roleSlug: string;
};

export const demoAccounts: DemoAccount[] = [
  {
    email: "director-general@rera.com",
    passwordSha256: "312433c28349f63c4f387953ff337046e794bea0f9b9ebfcb08e90046ded9c76",
    roleSlug: "director-general",
  },
];
