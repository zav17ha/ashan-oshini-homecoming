// Guest names travel inside the link as URL-safe base64, so every guest gets
// a unique address and no database is needed: /i/TmltYWwgJiBGYW1pbHk

export function encodeGuest(name: string): string {
  const bytes = new TextEncoder().encode(name.trim());
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeGuest(code: string | undefined | null): string {
  if (!code) return "";
  try {
    let s = decodeURIComponent(code).replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    const bin = atob(s);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true })
      .decode(bytes)
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 90);
  } catch {
    return "";
  }
}
