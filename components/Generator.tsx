"use client";

import { useEffect, useRef, useState } from "react";
import { encodeGuest } from "@/lib/guest";

type Guest = { name: string; sent: boolean };

const KEY = "hc-guests-v1", KTPL = "hc-tpl-v1";
const DEFAULT_TPL =
  "Dear {name},\n\nWith joy in our hearts, we invite you to celebrate our homecoming on 18th December 2026 at 7:00 PM.\n\nPlease open your personal invitation here:\n{link}\n\nWith love,\nAshan & Oshini";

function load<T>(k: string, d: T): T {
  try {
    const v = localStorage.getItem(k);
    return v === null ? d : (JSON.parse(v) as T);
  } catch {
    return d;
  }
}
function save(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}

const WA = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2s.2-1.1.1-1.2l-.4-.3z" />
  </svg>
);

export default function Generator() {
  const [ready, setReady] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [origin, setOrigin] = useState("");
  const [tpl, setTpl] = useState(DEFAULT_TPL);
  const [names, setNames] = useState("");
  const [q, setQ] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setGuests(load<Guest[]>(KEY, []));
    setOrigin(window.location.origin);
    setTpl(load(KTPL, DEFAULT_TPL));
    setReady(true);
  }, []);
  useEffect(() => { if (ready) save(KEY, guests); }, [guests, ready]);
  useEffect(() => { if (ready) save(KTPL, tpl); }, [tpl, ready]);

  const linkFor = (name: string) => `${origin}/i/${encodeGuest(name)}`;
  const message = (name: string) => tpl.split("{name}").join(name).split("{link}").join(linkFor(name));

  function say(t: string) {
    setToast(t);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1900);
  }

  function copy(text: string, done: string) {
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        say(done);
      } catch {
        say("Select the text and copy it manually");
      }
      ta.remove();
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => say(done), fallback);
    else fallback();
  }

  function addGuests() {
    const have = new Set(guests.map((g) => g.name.toLowerCase()));
    const fresh: Guest[] = [];
    let dup = 0;
    names.split("\n").map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean).forEach((n) => {
      if (have.has(n.toLowerCase())) return void dup++;
      have.add(n.toLowerCase());
      fresh.push({ name: n, sent: false });
    });
    if (!fresh.length && !dup) return say("Type at least one name");
    setGuests([...guests, ...fresh]);
    setNames("");
    say(`${fresh.length} ${fresh.length === 1 ? "link" : "links"} created${dup ? ` · ${dup} already listed` : ""}`);
  }

  function update(i: number, patch: Partial<Guest> | null) {
    setGuests((gs) => (patch === null ? gs.filter((_, j) => j !== i) : gs.map((g, j) => (j === i ? { ...g, ...patch } : g))));
  }

  function downloadCsv() {
    if (!guests.length) return say("No guests yet");
    const cell = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const rows = [["Name", "Link", "Sent"], ...guests.map((g) => [g.name, linkFor(g.name), g.sent ? "Yes" : "No"])];
    const blob = new Blob(["﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ashan-oshini-guest-links.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const sent = guests.filter((g) => g.sent).length;
  const query = q.trim().toLowerCase();
  const shown = guests.map((g, i) => ({ g, i })).filter(({ g }) => !query || g.name.toLowerCase().includes(query));

  return (
    <div className="gen">
      <header className="gen-head">
        <h1>Ashan &amp; Oshini</h1>
        <p>Guest link studio · private</p>
        <nav className="gen-nav"><a href="/responses">View replies</a><span>·</span><a href="/" target="_blank" rel="noopener noreferrer">View invitation</a></nav>
      </header>

      <div className="gen-desk">
        <div className="col">
          <section className="box">
            <h2>1 · Add guests</h2>
            <label htmlFor="names">Guest names, one per line</label>
            <textarea id="names" value={names} onChange={(e) => setNames(e.target.value)} placeholder={"Nimal & Family\nMr. & Mrs. Perera\nKasun Fernando"} />
            <p className="help">Write each name exactly as it should appear on the invitation.</p>
            <div className="row"><button className="gbtn solid" type="button" onClick={addGuests}>Create links</button></div>
          </section>

          <section className="box">
            <h2>2 · WhatsApp message</h2>
            <label htmlFor="tpl">Message template</label>
            <textarea id="tpl" className="tpl" value={tpl} onChange={(e) => setTpl(e.target.value)} />
            <p className="help"><code>{"{name}"}</code> becomes the guest&apos;s name and <code>{"{link}"}</code> their personal link.</p>
            <div className="row"><button className="gbtn ghost" type="button" onClick={() => { setTpl(DEFAULT_TPL); say("Message reset"); }}>Reset message</button></div>
          </section>
        </div>

        <div className="col">
          <div className="list-head">
            <div>
              <h2>Guest list</h2>
              <span className="stats">{guests.length} {guests.length === 1 ? "guest" : "guests"} · {sent} sent{query ? ` · ${shown.length} shown` : ""}</span>
            </div>
            <div className="tools">
              <input id="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a guest" aria-label="Find a guest" />
              <button className="gbtn ghost" type="button" onClick={() => guests.length ? copy(guests.map((g) => `${g.name} — ${linkFor(g.name)}`).join("\n"), `All ${guests.length} links copied`) : say("No guests yet")}>Copy all</button>
              <button className="gbtn ghost" type="button" onClick={downloadCsv}>Download CSV</button>
              {!confirmClear ? (
                <button className="gbtn ghost" type="button" onClick={() => guests.length && setConfirmClear(true)}>Clear list</button>
              ) : (
                <span className="confirm">
                  Delete every guest?
                  <button className="gbtn solid" type="button" onClick={() => { setGuests([]); setConfirmClear(false); say("List cleared"); }}>Yes, clear</button>
                  <button className="gbtn ghost" type="button" onClick={() => setConfirmClear(false)}>Keep</button>
                </span>
              )}
            </div>
          </div>

          {guests.length === 0 ? (
            <div className="empty"><strong>No guests yet</strong>Add names on the left and each guest gets a personal link here.</div>
          ) : (
            <ol className="glist">
              {shown.map(({ g, i }) => {
                const link = linkFor(g.name);
                return (
                  <li key={g.name} className={`guest${g.sent ? " sent" : ""}`}>
                    <span className="idx">{i + 1}</span>
                    <span className="name">
                      {g.name}
                      <button type="button" className="sent-tag" data-on={g.sent} onClick={() => update(i, { sent: !g.sent })} title="Mark as sent or not sent">
                        {g.sent ? "✓ Sent" : "Not sent"}
                      </button>
                    </span>
                    <span className="link" title={link}>{link}</span>
                    <span className="acts">
                      <button type="button" className="gbtn" onClick={() => copy(link, `Link copied for ${g.name}`)}>Copy link</button>
                      <a className="gbtn wa" href={`https://wa.me/?text=${encodeURIComponent(message(g.name))}`} target="_blank" rel="noopener noreferrer" onClick={() => update(i, { sent: true })}>{WA}WhatsApp</a>
                      <a className="gbtn ghost" href={link} target="_blank" rel="noopener noreferrer">Preview</a>
                      <button type="button" className="gbtn ghost" onClick={() => { update(i, null); say(`Removed ${g.name}`); }} aria-label={`Remove ${g.name}`}>Remove</button>
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
      <div className={`toast${toast ? " show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}
