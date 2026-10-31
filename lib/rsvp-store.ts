import { promises as fs } from "node:fs";
import path from "node:path";

export type Rsvp = {
  id: string;
  code: string | null;
  invitedAs: string | null;
  name: string;
  attending: boolean;
  message: string;
  createdAt: string;
  updatedAt: string;
};

const HASH = "homecoming:rsvps";

// Vercel's Upstash for Redis integration provides these (either naming works).
const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
// Local development without Redis keeps replies in a JSON file.
const FILE = path.join(process.cwd(), ".data", "rsvps.json");

export function storeReady(): boolean {
  return Boolean(REST_URL && REST_TOKEN) || !process.env.VERCEL;
}

async function redis<T>(command: (string | number)[]): Promise<T> {
  const res = await fetch(REST_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${REST_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const json = (await res.json()) as { result?: T; error?: string };
  if (!res.ok || json.error) throw new Error(json.error || `Redis error ${res.status}`);
  return json.result as T;
}

async function readFile(): Promise<Record<string, Rsvp>> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return {};
  }
}

export async function getRsvp(id: string): Promise<Rsvp | null> {
  if (REST_URL && REST_TOKEN) {
    const raw = await redis<string | null>(["HGET", HASH, id]);
    return raw ? (JSON.parse(raw) as Rsvp) : null;
  }
  return (await readFile())[id] ?? null;
}

export async function saveRsvp(rsvp: Rsvp): Promise<void> {
  if (REST_URL && REST_TOKEN) {
    await redis(["HSET", HASH, rsvp.id, JSON.stringify(rsvp)]);
    return;
  }
  const all = await readFile();
  all[rsvp.id] = rsvp;
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2));
}

export async function listRsvps(): Promise<Rsvp[]> {
  let list: Rsvp[];
  if (REST_URL && REST_TOKEN) {
    const flat = await redis<string[]>(["HGETALL", HASH]);
    list = [];
    for (let i = 1; i < flat.length; i += 2) list.push(JSON.parse(flat[i]) as Rsvp);
  } else {
    list = Object.values(await readFile());
  }
  return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteRsvp(id: string): Promise<void> {
  if (REST_URL && REST_TOKEN) {
    await redis(["HDEL", HASH, id]);
    return;
  }
  const all = await readFile();
  delete all[id];
  await fs.writeFile(FILE, JSON.stringify(all, null, 2));
}
