/**
 * The platform's one date and time style (project lead 2026-10-19; design standard D0.7):
 *   date       DD/MM/YYYY             05/10/2026
 *   time       hh:mm:ssAM / hh:mm:ssPM  09:42:21AM — 12-hour, seconds, no space before AM/PM
 *   timestamp  date, time             05/10/2026, 09:42:21AM
 * Months on their own ("October 2026") and waiting times ("3 days") stay in words.
 * Never hand a DD/MM/YYYY string to Date.parse — it reads it as MM/DD. Use toTime().
 */
const pad = (n: number) => String(n).padStart(2, "0");

/** A Date (read in UTC, as all sample dates are) → "05/10/2026". */
export const fmtDate = (d: Date) => `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;

/** 24-hour parts → "09:42:21AM". */
export function fmtTime(h: number, m: number, s: number) {
  return `${pad(h % 12 || 12)}:${pad(m)}:${pad(s)}${h >= 12 ? "PM" : "AM"}`;
}

/** → "05/10/2026, 09:42:21AM". */
export const fmtStamp = (d: Date, h: number, m: number, s: number) => `${fmtDate(d)}, ${fmtTime(h, m, s)}`;

/** The device clock now, as a time of day → "02:07:45PM". */
export const clockTime = (t = new Date()) => fmtTime(t.getHours(), t.getMinutes(), t.getSeconds());

const RE = /^(\d{2})\/(\d{2})\/(\d{4})(?:,\s*(\d{2}):(\d{2}):(\d{2})(AM|PM))?/;

/**
 * "05/10/2026" or "05/10/2026, 02:55:13PM" → milliseconds, for sorting and filtering.
 * A date with no time counts as the start of that day, so a timed entry on the same day sorts after it.
 */
export function toTime(s: string): number {
  const m = s.match(RE);
  if (!m) return 0;
  const h = m[4] ? (Number(m[4]) % 12) + (m[7] === "PM" ? 12 : 0) : 0;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), h, m[5] ? Number(m[5]) : 0, m[6] ? Number(m[6]) : 0).getTime();
}

/** Just the date part of a date or timestamp: "05/10/2026, 02:55:13PM" → "05/10/2026". */
export const dayOf = (s: string) => s.split(",")[0].trim();
