"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Reveal from "./Reveal";
import { WEDDING } from "@/lib/wedding";

/* ───────── Hero ───────── */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const textY = useTransform(scrollYProgress, [0.1, 0.8], ["0%", "-35%"]);
  const textO = useTransform(scrollYProgress, [0.1, 0.65], [1, 0]);

  return (
    <header ref={ref} className="hero">
      <motion.div className="hero-media" style={{ y: mediaY }}>
        <Image className="hero-img" src="/images/hero-shutters.jpg" alt="Ashan and Oshini by the white shutters in the golden evening light" fill priority quality={90} sizes="100vw" />
      </motion.div>
      <motion.div className="hero-text wrap" style={{ y: textY, opacity: textO }}>
        <p className="eyebrow hero-eyebrow">Our Homecoming</p>
        <h1 className="names" aria-label="Ashan and Oshini">
          <span className="ink n1" style={{ "--d": ".4s" } as React.CSSProperties}><span className="gold-text">{WEDDING.groom}</span></span>
          <span className="ink amp" style={{ "--d": "1.4s" } as React.CSSProperties}><span className="gold-text">&amp;</span></span>
          <span className="ink n2" style={{ "--d": "1.7s" } as React.CSSProperties}><span className="gold-text">{WEDDING.bride}</span></span>
        </h1>
        <div className="hero-date"><span className="rule" /><span>{WEDDING.dateDots}</span><span className="rule" /></div>
      </motion.div>
      <div className="scroll-cue" aria-hidden="true"><span>SCROLL</span><i /></div>
    </header>
  );
}

/* ───────── Ornament that draws itself ───────── */
function Ornament() {
  const draw = {
    initial: { pathLength: 0 },
    whileInView: { pathLength: 1 },
    viewport: { once: true, amount: 0.8 },
    transition: { duration: 2, ease: [0.6, 0, 0.3, 1] as [number, number, number, number] },
  };
  return (
    <svg className="ornament" viewBox="0 0 300 40" aria-hidden="true">
      <motion.path {...draw} d="M4 20 H112" />
      <motion.path {...draw} d="M188 20 H296" />
      <motion.path {...draw} d="M112 20 C124 4 138 4 150 20 C162 36 176 36 188 20" />
      <motion.path {...draw} d="M112 20 C124 36 138 36 150 20 C162 4 176 4 188 20" />
      <motion.circle initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.2, type: "spring" }} cx="150" cy="20" r="3.2" />
    </svg>
  );
}

/* ───────── Personal letter ───────── */
export function Letter({ guest }: { guest: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "4%"]);

  return (
    <section className="letter block wrap">
      <div className="letter-grid">
        <Reveal className="arch-photo">
          <div className="frame" ref={ref}>
            <motion.div className="parallax" style={{ y: imgY }}>
              <Image src="/images/closeup.jpg" alt="Oshini smiling up at Ashan" fill sizes="(min-width: 900px) 340px, 72vw" />
            </motion.div>
          </div>
        </Reveal>
        <div className="letter-text">
          <Ornament />
          <Reveal><p className="eyebrow">Dear</p></Reveal>
          <Reveal delay={0.1}><h2 className="script guest-big gold-text">{guest || "Our Beloved Guest"}</h2></Reveal>
          <Reveal delay={0.2}><p className="lead">With hearts full of joy, we invite you to celebrate our homecoming as we begin our new life together.</p></Reveal>
          <Reveal delay={0.25}><p className="lead">Your presence would mean the world to us.</p></Reveal>
          <Reveal delay={0.3}><p className="date-words">Friday, 18 December 2026 · 7:00 PM</p></Reveal>
          <Reveal delay={0.35}><p className="sign">{WEDDING.groom} &amp; {WEDDING.bride}</p></Reveal>
        </div>
      </div>
    </section>
  );
}

/* ───────── Countdown ───────── */
function Digit({ v }: { v: string }) {
  return (
    <span className="num">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={v}
          initial={{ y: "-70%", opacity: 0, rotateX: 80, filter: "blur(3px)" }}
          animate={{ y: "0%", opacity: 1, rotateX: 0, filter: "blur(0px)" }}
          exit={{ y: "60%", opacity: 0, filter: "blur(3px)" }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ display: "inline-block" }}
        >
          {v}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Countdown() {
  const target = new Date(WEDDING.startsAt).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const ms = now === null ? null : Math.max(0, target - now);
  const pad = (n: number) => String(n).padStart(2, "0");
  const parts =
    ms === null
      ? ["--", "--", "--", "--"]
      : [pad(Math.floor(ms / 864e5)), pad(Math.floor(ms / 36e5) % 24), pad(Math.floor(ms / 6e4) % 60), pad(Math.floor(ms / 1e3) % 60)];
  const units = ["Days", "Hours", "Minutes", "Seconds"];

  return (
    <section className="count block wrap on-dark">
      <div className="center">
        <Reveal><p className="eyebrow">Counting down to</p></Reveal>
        <Reveal delay={0.1}><h2 className="script gold-text count-title">our homecoming</h2></Reveal>
        <Reveal delay={0.2} className="tiles">
          {parts.map((p, i) => (
            <div className="tile" key={units[i]}>
              <Digit v={p} />
              <span className="unit">{units[i]}</span>
            </div>
          ))}
        </Reveal>
        <Reveal delay={0.3}>
          <p className="count-note">{ms === 0 ? "Tonight we celebrate!" : "until 7:00 in the evening, 18 December 2026"}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────── Arch window opens into a full-bleed photo ───────── */
export function Unveil() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.7],
    ["inset(14% 20% 14% 20% round 46vw 46vw 8px 8px)", "inset(0% 0% 0% 0% round 0vw 0vw 0px 0px)"]
  );
  const scale = useTransform(scrollYProgress, [0, 0.8], [1.12, 1]);
  const textO = useTransform(scrollYProgress, [0.55, 0.85], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.55, 0.85], [40, 0]);

  return (
    <section ref={ref} className="unveil">
      <div className="unveil-stage">
        <motion.div className="unveil-img" style={{ clipPath }}>
          <motion.div className="unveil-zoom" style={{ scale }}>
            {/* Wide screens get the landscape photo; tall phone screens get the portrait. */}
            <Image className="u-wide" src="/images/arches-landscape.jpg" alt="Ashan leaning on a stone pillar as Oshini sweeps past in her red gown" fill quality={90} sizes="100vw" />
            <Image className="u-tall" src="/images/portrait-couple.jpg" alt="Ashan and Oshini smiling together in the golden evening light" fill quality={90} sizes="100vw" />
          </motion.div>
        </motion.div>
        <motion.div className="unveil-text wrap" style={{ opacity: textO, y: textY }}>
          <p className="eyebrow light">Two hearts</p>
          <p className="script gold-text">one beautiful journey</p>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────── Save the date ───────── */
export function SaveTheDate() {
  const days: (number | null)[] = [null, null, ...Array.from({ length: 31 }, (_, i) => i + 1)]; // 1 Dec 2026 is a Tuesday
  return (
    <section className="date-sec block wrap">
      <div className="center">
        <Reveal><p className="eyebrow">Save the date</p></Reveal>
        <Reveal delay={0.1} className="card">
          <p className="month">December 2026</p>
          <div className="cal" aria-label="December 2026 calendar with Friday the 18th marked">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <span className="dow" key={d}>{d}</span>)}
            {days.map((d, i) =>
              d === 18 ? (
                <span className="day16" key={i}>
                  <motion.i className="dot" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.8, type: "spring", stiffness: 260, damping: 14 }} />
                  <b>18</b>
                  <svg viewBox="0 0 100 100" aria-hidden="true">
                    <motion.path
                      d="M50 6 C78 4 96 24 94 52 C92 80 70 96 46 94 C20 92 4 72 6 46 C8 22 28 8 56 9"
                      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
                      transition={{ delay: 1.1, duration: 1.4, ease: "easeInOut" }}
                    />
                  </svg>
                </span>
              ) : (
                <span key={i}>{d ?? ""}</span>
              )
            )}
          </div>
          <div className="when">
            <span className="side">Friday</span><span className="big">18</span><span className="side">2026</span>
          </div>
          <div className="ceremony">
            <p className="script">{WEDDING.ceremony}</p>
            <p className="time">{WEDDING.time}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────── Venue: the arch draws itself as you scroll ───────── */
export function Venue() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "center 45%"] });
  const p1 = useTransform(scrollYProgress, [0, 0.8], [0, 1]);
  const p2 = useTransform(scrollYProgress, [0.15, 1], [0, 1]);
  const nameO = useTransform(scrollYProgress, [0.55, 1], [0, 1]);
  const nameY = useTransform(scrollYProgress, [0.55, 1], [24, 0]);

  return (
    <section className="venue block wrap">
      <div className="center">
        <Reveal><p className="eyebrow light">The venue</p></Reveal>
        <div className="venue-arch" ref={ref}>
          <svg viewBox="0 0 320 400" aria-hidden="true">
            <motion.path style={{ pathLength: p1 }} d="M20 392 V170 A140 140 0 0 1 300 170 V392" />
            <motion.path style={{ pathLength: p2 }} className="thin" d="M34 392 V170 A126 126 0 0 1 286 170 V392" />
            <motion.path style={{ pathLength: p1 }} d="M6 392 H314" />
            <motion.path style={{ pathLength: p2 }} className="thin" d="M14 384 H306" />
            <motion.path style={{ pathLength: p1 }} d="M160 6 L172 20 L160 34 L148 20 Z" />
            <motion.path style={{ pathLength: p2 }} className="thin" d="M110 26 C130 26 140 18 148 20 M210 26 C190 26 180 18 172 20" />
            <motion.circle style={{ pathLength: p2 }} className="thin" cx="160" cy="20" r="22" />
          </svg>
          <motion.div className="venue-name" style={{ opacity: nameO, y: nameY }}>
            <svg className="pin" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
              <circle cx="12" cy="10" r="2.6" />
            </svg>
            <h3>Senuri Grand<br />Castello</h3>
            <span className="city">{WEDDING.city}</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Farewell ───────── */
export function Farewell({ guest }: { guest: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-10%", "2%"]);

  return (
    <section className="farewell block wrap">
      <div className="center">
        <Reveal><p className="eyebrow">See you there</p></Reveal>
        <Reveal delay={0.1}>
          <h2 className="script farewell-title">
            We can&apos;t wait to celebrate with you{guest ? <>, <span className="nowrap-name">{guest}</span></> : ""}
          </h2>
        </Reveal>
        <Reveal delay={0.2} className="tall">
          <div className="frame" ref={ref}>
            <motion.div className="parallax" style={{ y: imgY }}>
              <Image src="/images/ledge.jpg" alt="Ashan and Oshini beneath an arched window" fill quality={90} sizes="(min-width: 600px) 420px, 84vw" style={{ objectPosition: "50% 72%" }} />
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-foot">
      <span className="mono">A<i>&amp;</i>O</span>
      <p>18 · 12 · 2026 · Divulapitiya</p>
    </footer>
  );
}
