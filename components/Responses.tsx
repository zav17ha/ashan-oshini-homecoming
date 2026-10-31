"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { encodeGuest } from "@/lib/guest";
import type { Rsvp } from "@/lib/rsvp-store";

type Filter = "all" | "yes" | "no" | "waiting";
const KPASS = "hc-admin-key";

function when(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function Responses() {
  const [key, setKey] = useState("");
  const [entered, setEntered] = useState("");
  const [rsvps, setRsvps] = useState<Rsvp[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [invited, setInvited] = useState<string[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback(async (k: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/rsvp", { headers: { "x-admin-key": k }, cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't load replies.");
      setRsvps(json.rsvps);
      setKey(k);
      try { sessionStorage.setItem(KPASS, k); } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load replies.");
      setRsvps(null);
      try { sessionStorage.removeItem(KPASS); } catch {}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KPASS);
      if (saved) load(saved);
      // Guests added in the link studio on this device, to show who hasn't replied.
      const list = JSON.parse(localStorage.getItem("hc-guests-v1") || "[]") as { name: string }[];
      setInvited(list.map((g) => g.name));
    } catch {}
  }, [load]);

  const stats = useMemo(() => {
    const list = rsvps ?? [];
    const yes = list.filter((r) => r.attending);
    return {
      replies: list.length,
      yes: yes.length,
      no: list.length - yes.length,
    };
  }, [rsvps]);

  const waiting = useMemo(() => {
    const replied = new Set((rsvps ?? []).map((r) => r.code).filter(Boolean));
    return invited.filter((n) => !replied.has(encodeGuest(n)));
  }, [rsvps, invited]);

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (rsvps ?? []).filter((r) => {
      if (filter === "yes" && !r.attending) return false;
      if (filter === "no" && r.attending) return false;
      return !query || `${r.name} ${r.invitedAs ?? ""} ${r.message}`.toLowerCase().includes(query);
    });
  }, [rsvps, filter, q]);

  async function remove(id: string) {
    const res = await fetch(`/api/rsvp?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: { "x-admin-key": key } });
    if (res.ok) setRsvps((list) => (list ?? []).filter((r) => r.id !== id));
    setConfirmId(null);
  }

  function downloadCsv() {
    const cell = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
    const rows = [
      ["Name", "Invited as", "Reply", "Message", "Replied"],
      ...(rsvps ?? []).map((r) => [r.name, r.invitedAs ?? "", r.attending ? "Attending" : "Can't make it", r.message, when(r.updatedAt)]),
    ];
    const blob = new Blob(["﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ashan-oshini-rsvps.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  if (!rsvps) {
    return (
      <div className="gen">
        <header className="gen-head">
          <h1>Ashan &amp; Oshini</h1>
          <p>Guest replies · private</p>
        </header>
        <form className="gate-form" onSubmit={(e) => { e.preventDefault(); if (entered) load(entered); }}>
          <label htmlFor="pass">Password</label>
          <input id="pass" type="password" value={entered} onChange={(e) => setEntered(e.target.value)} autoComplete="current-password" autoFocus />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="gbtn solid" type="submit" disabled={loading || !entered}>{loading ? "Opening…" : "View replies"}</button>
          <p className="help">This is the ADMIN_PASSWORD you set in Vercel.</p>
        </form>
      </div>
    );
  }

  return (
    <div className="gen">
      <header className="gen-head">
        <h1>Ashan &amp; Oshini</h1>
        <p>Guest replies · private</p>
        <nav className="gen-nav"><a href="/generator">Guest links</a><span>·</span><a href="/" target="_blank" rel="noopener noreferrer">View invitation</a></nav>
      </header>

      <div className="resp">
        <div className="stat-row">
          <div className="stat hero-stat"><b>{stats.yes}</b><span>coming</span></div>
          <div className="stat"><b>{stats.replies}</b><span>{stats.replies === 1 ? "reply" : "replies"}</span></div>
          <div className="stat"><b>{stats.no}</b><span>can&apos;t make it</span></div>
          <div className="stat"><b>{invited.length ? waiting.length : "–"}</b><span>awaiting reply</span></div>
        </div>

        <div className="list-head">
          <div className="tabs" role="tablist">
            {([
              ["all", `All (${stats.replies})`],
              ["yes", `Attending (${stats.yes})`],
              ["no", `Can't make it (${stats.no})`],
              ["waiting", `Awaiting (${invited.length ? waiting.length : 0})`],
            ] as [Filter, string][]).map(([f, label]) => (
              <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>{label}</button>
            ))}
          </div>
          <div className="tools">
            {filter !== "waiting" && <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a guest" aria-label="Find a guest" />}
            <button className="gbtn ghost" type="button" onClick={() => load(key)} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button>
            <button className="gbtn ghost" type="button" onClick={downloadCsv} disabled={!rsvps.length}>Download CSV</button>
          </div>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}

        {filter === "waiting" ? (
          !invited.length ? (
            <div className="empty"><strong>No guest list on this device</strong>Open this page on the phone or computer you used to create the guest links.</div>
          ) : waiting.length === 0 ? (
            <div className="empty"><strong>Everyone has replied</strong>Every guest you created a link for has answered.</div>
          ) : (
            <ol className="glist">
              {waiting.map((n) => <li key={n} className="reply waiting"><span className="name">{n}</span><span className="pill wait">No reply yet</span></li>)}
            </ol>
          )
        ) : shown.length === 0 ? (
          <div className="empty"><strong>No replies yet</strong>Replies appear here as soon as guests press “Send my reply”.</div>
        ) : (
          <ol className="glist">
            {shown.map((r) => (
              <li key={r.id} className={`reply ${r.attending ? "yes" : "no"}`}>
                <div className="reply-top">
                  <span className="name">{r.name}</span>
                  <span className={`pill ${r.attending ? "go" : "nogo"}`}>{r.attending ? "Attending" : "Can't make it"}</span>
                </div>
                {r.invitedAs && r.invitedAs !== r.name && <span className="meta">Invited as {r.invitedAs}</span>}
                {r.message && <p className="note">“{r.message}”</p>}
                <div className="reply-foot">
                  <span className="meta">{r.createdAt !== r.updatedAt ? "Updated " : "Replied "}{when(r.updatedAt)}{!r.invitedAs && " · from the general link"}</span>
                  {confirmId === r.id ? (
                    <span className="confirm">Remove this reply? <button className="gbtn solid" onClick={() => remove(r.id)}>Remove</button><button className="gbtn ghost" onClick={() => setConfirmId(null)}>Keep</button></span>
                  ) : (
                    <button className="text-link" onClick={() => setConfirmId(r.id)}>Remove</button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
