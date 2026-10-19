#!/usr/bin/env node
/**
 * Design check — design standard Section D0 ("How it becomes impossible to drift").
 * Runs before every build (`prebuild`). Fails the build when screen code uses a
 * value that isn't one of the named foundations in src/app/globals.css, or
 * hand-makes a control that components/ui already provides.
 *
 * Run by hand: npm run check:design
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = new URL("../src/", import.meta.url).pathname;
const PALETTES = "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const B = "(?<![\\w-])"; // start of a class name
const E = "(?![\\w-])"; // end of a class name

const RULES = [
  { id: "raw-colour", why: "Raw colour value — use a colour token (text-strong, bg-action…)", re: /#[0-9a-fA-F]{3,8}\b|rgba?\(/g },
  { id: "tailwind-palette", why: "Tailwind's own palette — use a colour token", re: new RegExp(`${B}(?:[a-z]+:)*(?:bg|text|border|ring|outline|accent|fill|stroke|divide|decoration|from|to|via)-(?:${PALETTES})-\\d{2,3}${E}|${B}(?:bg|text|border)-black${E}`, "g") },
  { id: "typed-text", why: "Typed text size/weight/line-height — use a text style (type-body, type-page-title…)", re: new RegExp(`${B}(?:[a-z]+:)*(?:text-(?:xs|sm|base|lg|[2-9]?xl)|font-(?:thin|light|normal|medium|semibold|bold|extrabold|black)|leading-[\\w.\\[\\]-]+|tracking-[\\w.\\[\\]-]+)${E}`, "g") },
  { id: "arbitrary-value", why: "Arbitrary value in [ ] — add a named token to globals.css instead", re: /(?<![\w-])(?:[a-z]+:)*[a-z]+(?:-[a-z0-9]+)*-\[[^\]\s]+\]/g },
  { id: "radius", why: "Corner size not in the foundations — use rounded-control, rounded-card, rounded-full (or rounded-signin on sign-in)", re: new RegExp(`${B}rounded(?:-[trblse]{1,2})?(?:-(?:none|xs|sm|md|lg|xl|2xl|3xl))?${E}`, "g") },
  { id: "shadow", why: "Shadow not in the foundations — use shadow-overlay or shadow-hairline", re: new RegExp(`${B}shadow(?:-(?:2xs|xs|sm|md|lg|xl|2xl|inner))?${E}`, "g") },
  { id: "off-grid-spacing", why: "Spacing off the 4-px grid — use 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8 …", re: new RegExp(`${B}-?(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y)-(?!0\\.5|1\\.5|2\\.5)\\d+\\.\\d+${E}`, "g") },
];
// Raw form controls are allowed only inside the shared component folders.
const CONTROL = { id: "hand-made-control", why: "Hand-made control — use Button / ButtonLink / TextInput / TextArea / Checkbox from components/ui", re: /<(button|input|textarea|select)\b/g };
// Detail screens open with the shared Breadcrumb + DetailHeader, never a hand-drawn "← Back" link.
const BACK_LINK = { id: "hand-made-back-link", why: "Hand-made back link — open the screen with Breadcrumb + DetailHeader from components/ui/Cards", re: /←/g };
const CONTROL_OK = [`components${sep}ui${sep}`, `components${sep}shell${sep}`];

function files(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : /\.(tsx?|jsx?)$/.test(n) ? [p] : [];
  });
}

const problems = [];
for (const file of files(ROOT)) {
  const rel = relative(ROOT, file);
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    // ignore comments: // …, /* … */, {/* … */}, and JSDoc lines
    const code = line.replace(/\{?\/\*.*?\*\/\}?/g, "").replace(/\/\/.*$/, "").replace(/^\s*(\/\*\*|\*).*$/, "");
    const rules = CONTROL_OK.some((ok) => rel.includes(ok)) ? RULES : [...RULES, CONTROL, BACK_LINK];
    for (const r of rules) for (const m of code.matchAll(r.re)) problems.push(`  ${rel}:${i + 1}  ${m[0]}  — ${r.why}`);
  });
}

if (problems.length) {
  console.error(`\n✗ Design check failed — ${problems.length} problem(s). Rules: design standard Section D0.\n`);
  console.error(problems.join("\n"));
  console.error("");
  process.exit(1);
}
console.log("✓ Design check passed — every value comes from the foundations.");
