"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "./Reveal";
import { WEDDING } from "@/lib/wedding";

type Props = { guest: string; code: string };
type Sent = { name: string; attending: boolean };

const WA_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2s.2-1.1.1-1.2l-.4-.3z" />
  </svg>
);

export default function Rsvp({ guest, code }: Props) {
  const memoKey = `hc-rsvp:${code || "open"}`;
  const [name, setName] = useState(guest);
  const [attending, setAttending] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [sent, setSent] = useState<Sent | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(memoKey);
      if (saved) setSent(JSON.parse(saved));
    } catch {}
  }, [memoKey]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Please write your name."), setStatus("error");
    if (attending === null) return setError("Please choose whether you can come."), setStatus("error");
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code: code || null, attending, message, website }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "We couldn't save your reply. Please try again.");
      const done: Sent = { name: name.trim(), attending };
      setSent(done);
      setStatus("idle");
      try { localStorage.setItem(memoKey, JSON.stringify(done)); } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't save your reply. Please try again.");
      setStatus("error");
    }
  }

  return (
    <section className="rsvp block wrap" id="rsvp">
      <div className="center">
        <Reveal><p className="eyebrow">Kindly reply</p></Reveal>
        <Reveal delay={0.1}><h2 className="script rsvp-title">Will you join us?</h2></Reveal>

        <Reveal delay={0.2} className="rsvp-card">
          <div className="rsvp-crown" aria-hidden="true">
            <span className="crown-medal">A<em>&amp;</em>O</span>
            <span className="crown-label">RSVP</span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.div key="thanks" className="thanks" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
                <svg className="thanks-mark" viewBox="0 0 80 80" aria-hidden="true">
                  <motion.circle cx="40" cy="40" r="36" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeInOut" }} />
                  <motion.path
                    d={sent.attending ? "M40 58 C22 46 16 38 16 30 C16 23 21 18 27 18 C33 18 37 22 40 27 C43 22 47 18 53 18 C59 18 64 23 64 30 C64 38 58 46 40 58 Z" : "M26 41 L36 51 L55 30"}
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, delay: 0.8, ease: "easeInOut" }}
                  />
                </svg>
                <p className="script thanks-title">Thank you, {sent.name}!</p>
                <p className="lead">
                  {sent.attending
                    ? "We've saved your place. We can't wait to celebrate with you on 18 December."
                    : "Thank you for letting us know. We'll miss you, and we'll be thinking of you on the day."}
                </p>
                <button type="button" className="text-btn" onClick={() => { setSent(null); setAttending(sent.attending); }}>
                  Change my reply
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" className="rsvp-form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} noValidate>
                <label className="field">
                  <span>Your name</span>
                  <input id="rsvp-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" autoComplete="name" maxLength={90} />
                </label>

                <div className="choice-big" role="radiogroup" aria-label="Can you come?">
                  <button type="button" role="radio" aria-checked={attending === true} className={attending === true ? "on" : ""} onClick={() => setAttending(true)}>
                    <span className="ico">♥</span>I&apos;ll be there
                  </button>
                  <button type="button" role="radio" aria-checked={attending === false} className={attending === false ? "on" : ""} onClick={() => setAttending(false)}>
                    <span className="ico">✉</span>Can&apos;t make it
                  </button>
                </div>

                <label className="field">
                  <span>A note for us <em>(optional)</em></span>
                  <textarea id="rsvp-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={600} placeholder="Wishes, dietary needs, anything we should know" />
                </label>

                <input className="hp" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} aria-hidden="true" />

                {status === "error" && <p className="form-error" role="alert">{error}</p>}

                <button type="submit" className="btn solid submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send my reply"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>

        <Reveal delay={0.1} className="ask">
          <p className="eyebrow">Questions? Message us</p>
          <div className="ask-row">
            {WEDDING.contacts.map((c) => (
              <div className="ask-person" key={c.name}>
                <span className="script">{c.name}</span>
                <span className="phone">{c.display}</span>
                <span className="ask-acts">
                  <a className="btn small solid" href={`https://wa.me/${c.phone}`} target="_blank" rel="noopener noreferrer">{WA_ICON} WhatsApp</a>
                  <a className="btn small" href={`tel:+${c.phone}`}>Call</a>
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
