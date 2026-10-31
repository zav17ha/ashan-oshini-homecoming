import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { decodeGuest } from "@/lib/guest";
import { deleteRsvp, getRsvp, listRsvps, saveRsvp, storeReady, type Rsvp } from "@/lib/rsvp-store";

export const dynamic = "force-dynamic";

const NOT_READY = "Replies can't be saved yet: the database isn't connected. See README → RSVP setup.";

function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function isAdmin(req: NextRequest): boolean | null {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return null;
  const given = req.headers.get("x-admin-key") ?? "";
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

function guard(req: NextRequest) {
  const ok = isAdmin(req);
  if (ok === null) return NextResponse.json({ error: "Set ADMIN_PASSWORD in Vercel to view replies." }, { status: 503 });
  if (!ok) return NextResponse.json({ error: "That password isn't right." }, { status: 401 });
  return null;
}

/** A guest sends or updates their reply. */
export async function POST(req: NextRequest) {
  if (!storeReady()) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 400 });
  }
  if (body.website) return NextResponse.json({ ok: true }); // honeypot: bots fill hidden fields

  const name = clean(body.name, 90);
  const code = clean(body.code, 200) || null;
  const invitedAs = code ? decodeGuest(code) || null : null;
  if (!name) return NextResponse.json({ error: "Please write your name." }, { status: 400 });
  if (typeof body.attending !== "boolean") return NextResponse.json({ error: "Please choose whether you can come." }, { status: 400 });

  // One reply per invitation link; replying again updates it.
  const id = invitedAs ? `c:${code}` : `n:${name.toLowerCase()}`;
  const now = new Date().toISOString();
  try {
    const prev = await getRsvp(id);
    const rsvp: Rsvp = {
      id, code: invitedAs ? code : null, invitedAs, name,
      attending: body.attending,
      message: clean(body.message, 600),
      createdAt: prev?.createdAt ?? now, updatedAt: now,
    };
    await saveRsvp(rsvp);
    return NextResponse.json({ ok: true, rsvp: { name: rsvp.name, attending: rsvp.attending } });
  } catch (e) {
    console.error("RSVP save failed", e);
    return NextResponse.json({ error: "We couldn't save your reply. Please try again, or message us on WhatsApp." }, { status: 500 });
  }
}

/** The couple's responses page reads every reply. */
export async function GET(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  if (!storeReady()) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  try {
    return NextResponse.json({ rsvps: await listRsvps() }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("RSVP list failed", e);
    return NextResponse.json({ error: "Couldn't load replies. Check the database connection in Vercel." }, { status: 500 });
  }
}

/** Remove a reply (for test entries or mistakes). */
export async function DELETE(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing reply id." }, { status: 400 });
  await deleteRsvp(id);
  return NextResponse.json({ ok: true });
}
