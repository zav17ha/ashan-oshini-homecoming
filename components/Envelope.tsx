"use client";

import { useRef } from "react";
import { useAnimate } from "framer-motion";
import { celebrate } from "./effects";
import { WEDDING } from "@/lib/wedding";

type Props = { guest: string; onOpening: () => void; onOpened: () => void };

const EASE_OUT: [number, number, number, number] = [0.2, 0.8, 0.2, 1];
const EASE_INOUT: [number, number, number, number] = [0.6, 0, 0.3, 1];
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function Seal() {
  return (
    <svg viewBox="0 0 132 132" aria-hidden="true">
      <defs>
        <radialGradient id="wax" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#a42a3c" />
          <stop offset=".55" stopColor="#6e1222" />
          <stop offset="1" stopColor="#3a0711" />
        </radialGradient>
      </defs>
      <path fill="url(#wax)" d="M66 3c9 0 14 6 22 8s16-1 21 6 2 15 6 22 10 12 9 21-8 12-9 21 3 16-3 22-15 3-22 8-11 14-24 15-14-9-22-11-17 2-22-5-1-15-6-22S2 75 3 66s8-13 9-21-3-15 3-21 14-3 22-7S56 3 66 3z" />
      <circle cx="66" cy="66" r="44" fill="none" stroke="#c9a24e" strokeWidth="1.4" opacity=".9" />
      <circle cx="66" cy="66" r="39" fill="none" stroke="#c9a24e" strokeWidth=".7" opacity=".6" strokeDasharray="2 3" />
      <text x="66" y="76" textAnchor="middle" fontFamily="var(--font-caps), serif" fontSize="27" letterSpacing="1" fill="#f4dea0">A&amp;O</text>
    </svg>
  );
}

export default function Envelope({ guest, onOpening, onOpened }: Props) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const busy = useRef(false);

  async function open() {
    if (busy.current) return;
    busy.current = true;
    const root = scope.current;
    const seal = root.querySelector(".seal") as HTMLElement;
    const r = seal.getBoundingClientRect();
    celebrate(r.left + r.width / 2, r.top + r.height / 2);
    root.classList.add("is-opening");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onOpening();
      await animate(root, { opacity: 0 }, { duration: 0.4 });
      onOpened();
      return;
    }

    // 1 · the wax seal cracks in two
    await Promise.all([
      animate(".seal-l", { x: -80, y: 40, rotate: -50, opacity: 0 }, { duration: 0.8, ease: EASE_OUT }),
      animate(".seal-r", { x: 80, y: 40, rotate: 50, opacity: 0 }, { duration: 0.8, ease: EASE_OUT }),
      animate(".opener-hint", { opacity: 0 }, { duration: 0.4 }),
    ]);
    // 2 · the flap lifts open
    await animate(".env-flap", { rotateX: 180 }, { duration: 0.9, ease: EASE_INOUT });
    (root.querySelector(".env-flap") as HTMLElement).style.zIndex = "1";
    // 3 · the card slides out
    await Promise.all([
      animate(".env-card", { y: "-62%" }, { duration: 1.2, ease: EASE_OUT }),
      animate(".opener-top", { opacity: 0, y: -20 }, { duration: 0.6 }),
    ]);
    await wait(650);
    // 4 · envelope falls away, the card blooms into the page
    onOpening();
    await Promise.all([
      animate(".env-body", { y: "75vh", opacity: 0 }, { duration: 1, ease: EASE_INOUT }),
      animate(".env-card", { scale: 2.6, opacity: 0 }, { duration: 1.2, ease: EASE_INOUT, delay: 0.2 }),
      animate(".opener-bg", { opacity: 0 }, { duration: 1.1, delay: 0.45 }),
    ]);
    onOpened();
  }

  return (
    <div ref={scope} className="opener" onClick={open} role="dialog" aria-label="Your homecoming invitation">
      <div className="opener-bg" />
      <div className="opener-inner">
        <div className="opener-top">
          <p className="eyebrow light">A homecoming invitation for</p>
          <p className="opener-name gold-text">{guest || "Our Beloved Guest"}</p>
        </div>

        <div className="env-float">
          <div className="env">
            <div className="env-back env-body" />
            <div className="env-card">
              <div className="card-inner">
                <span className="card-mono">A &amp; O</span>
                <span className="card-names">{WEDDING.groom} &amp; {WEDDING.bride}</span>
                <span className="card-rule" />
                <span className="card-date">{WEDDING.dateDots}</span>
              </div>
            </div>
            <svg className="env-front env-body" viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="pocketL" x1="0" x2="1"><stop offset="0" stopColor="#efe2c8" /><stop offset="1" stopColor="#f6ecd9" /></linearGradient>
                <linearGradient id="pocketR" x1="1" x2="0"><stop offset="0" stopColor="#efe2c8" /><stop offset="1" stopColor="#f6ecd9" /></linearGradient>
                <linearGradient id="pocketB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#f1e5cd" /><stop offset="1" stopColor="#faf3e6" /></linearGradient>
              </defs>
              <polygon points="0,0 0,200 150,108" fill="url(#pocketL)" />
              <polygon points="300,0 300,200 150,108" fill="url(#pocketR)" />
              <polygon points="0,200 300,200 150,92" fill="url(#pocketB)" />
              <polyline points="0,200 150,92 300,200" fill="none" stroke="#c9a24e" strokeWidth=".8" opacity=".7" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="env-flap env-body">
              <svg className="flap-face flap-out" viewBox="0 0 300 116" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="flapOut" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f8f0e1" /><stop offset="1" stopColor="#ecdec3" /></linearGradient>
                </defs>
                <polygon points="0,0 300,0 150,116" fill="url(#flapOut)" />
                <polyline points="0,0 150,116 300,0" fill="none" stroke="#c9a24e" strokeWidth=".9" opacity=".8" vectorEffect="non-scaling-stroke" />
              </svg>
              <svg className="flap-face flap-in" viewBox="0 0 300 116" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <pattern id="liner" width="14" height="14" patternUnits="userSpaceOnUse">
                    <rect width="14" height="14" fill="#5b0f1d" />
                    <circle cx="7" cy="7" r="1.3" fill="#c9a24e" opacity=".55" />
                    <path d="M0 7 L7 0 L14 7 L7 14 Z" fill="none" stroke="#c9a24e" strokeWidth=".4" opacity=".35" />
                  </pattern>
                </defs>
                <polygon points="0,116 300,116 150,0" fill="url(#liner)" />
                <polyline points="6,113 150,8 294,113" fill="none" stroke="#c9a24e" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <button type="button" className="seal" aria-label="Break the seal and open your invitation">
              <span className="seal-half seal-l"><Seal /></span>
              <span className="seal-half seal-r"><Seal /></span>
            </button>
          </div>
        </div>

        <p className="opener-hint">Tap the seal to open</p>
      </div>
    </div>
  );
}
