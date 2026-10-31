export const WEDDING = {
  groom: "Ashan",
  bride: "Oshini",
  // Homecoming · 7:00 PM Sri Lanka time
  startsAt: "2026-12-18T19:00:00+05:30",
  dateDots: "18 · 12 · 2026",
  ceremony: "Homecoming",
  time: "7:00 PM",
  venue: "Senuri Grand Castello",
  city: "Divulapitiya",
  contacts: [
    { name: "Oshini", display: "+94 76 674 5418", phone: "94766745418" },
    { name: "Ashan", display: "+94 77 024 4334", phone: "94770244334" },
  ],
} as const;

export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
