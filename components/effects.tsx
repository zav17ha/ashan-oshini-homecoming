"use client";

import { useEffect, useRef } from "react";

const GOLDS = ["#f4dea0", "#e7c675", "#c9a24e", "#fff3d1"];
const PETALS = ["#7e1b2d", "#9b2335", "#5b0f1d", "#b3313f", "#6a1424"];
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function fit(c: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  const ctx = c.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/** Fire a burst of gold sparks from (x, y) and a shower of maroon petals. */
export function celebrate(x: number, y: number) {
  window.dispatchEvent(new CustomEvent("celebrate", { detail: { x, y } }));
}

type Spark = { k: 0; x: number; y: number; vx: number; vy: number; r: number; life: number; dec: number; c: string };
type Petal = { k: 1; x: number; y: number; vx: number; vy: number; rot: number; vr: number; ph: number; s: number; c: string; t: number };

export function Celebration() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let raf = 0;
    function run(e: Event) {
      if (reduced() || !ref.current) return;
      const { x, y } = (e as CustomEvent<{ x: number; y: number }>).detail;
      const ctx = fit(ref.current);
      const W = innerWidth, H = innerHeight;
      const parts: (Spark | Petal)[] = [];
      for (let i = 0; i < 120; i++) {
        const a = rnd(0, Math.PI * 2), sp = rnd(2, 11);
        parts.push({ k: 0, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, r: rnd(0.8, 2.6), life: 1, dec: rnd(0.007, 0.016), c: GOLDS[i % 4] });
      }
      const petals = W < 700 ? 36 : 56;
      for (let i = 0; i < petals; i++) {
        parts.push({ k: 1, x: rnd(0, W), y: rnd(-H * 0.6, -20), vy: rnd(2, 3.6), vx: rnd(-0.4, 0.4), rot: rnd(0, 6.3), vr: rnd(-0.05, 0.05), ph: rnd(0, 6.3), s: rnd(6, 12), c: PETALS[i % 5], t: 0 });
      }
      cancelAnimationFrame(raf);
      const frame = () => {
        ctx.clearRect(0, 0, W, H);
        for (let j = parts.length - 1; j >= 0; j--) {
          const p = parts[j];
          if (p.k === 0) {
            p.vx *= 0.975; p.vy = p.vy * 0.975 + 0.09; p.x += p.vx; p.y += p.vy; p.life -= p.dec;
            if (p.life <= 0) { parts.splice(j, 1); continue; }
            ctx.fillStyle = p.c;
            ctx.globalAlpha = p.life * 0.25;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.2, 0, 6.283); ctx.fill();
            ctx.globalAlpha = p.life;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
          } else {
            p.t++; p.y += p.vy; p.x += p.vx + Math.sin(p.t * 0.03 + p.ph) * 0.9; p.rot += p.vr;
            if (p.y > H + 30) { parts.splice(j, 1); continue; }
            ctx.save();
            ctx.translate(p.x, p.y); ctx.rotate(p.rot);
            ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(p.t * 0.04 + p.ph)));
            ctx.globalAlpha = 0.92; ctx.fillStyle = p.c;
            ctx.beginPath();
            ctx.moveTo(0, -p.s);
            ctx.bezierCurveTo(p.s * 0.9, -p.s * 0.6, p.s * 0.7, p.s * 0.7, 0, p.s);
            ctx.bezierCurveTo(-p.s * 0.7, p.s * 0.7, -p.s * 0.9, -p.s * 0.6, 0, -p.s);
            ctx.fill();
            ctx.globalAlpha = 0.25; ctx.fillStyle = "#fff";
            ctx.beginPath(); ctx.ellipse(-p.s * 0.2, -p.s * 0.3, p.s * 0.18, p.s * 0.45, 0, 0, 6.283); ctx.fill();
            ctx.restore();
          }
        }
        ctx.globalAlpha = 1;
        if (parts.length) raf = requestAnimationFrame(frame);
        else ctx.clearRect(0, 0, W, H);
      };
      raf = requestAnimationFrame(frame);
    }
    window.addEventListener("celebrate", run);
    return () => { window.removeEventListener("celebrate", run); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={ref} className="fx-canvas" aria-hidden="true" />;
}

/** Slow gold dust drifting upward over the whole page. */
export function GoldDust() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reduced() || !ref.current) return;
    const c = ref.current;
    let ctx = fit(c), W = innerWidth, H = innerHeight, raf = 0;
    const N = W < 700 ? 26 : 46;
    const ps = Array.from({ length: N }, () => ({ x: rnd(0, W), y: rnd(0, H), r: rnd(0.5, 1.8), vy: rnd(-0.45, -0.12), vx: rnd(-0.15, 0.15), ph: rnd(0, 6.3) }));
    const onResize = () => { ctx = fit(c); W = innerWidth; H = innerHeight; };
    window.addEventListener("resize", onResize);
    const frame = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      ps.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = H + 10; p.x = rnd(0, W); }
        ctx.globalAlpha = 0.18 + 0.4 * (0.5 + 0.5 * Math.sin(t * 0.0018 + p.ph));
        ctx.fillStyle = i % 3 ? "#e7c675" : "#fff3d1";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={ref} className="dust-canvas" aria-hidden="true" />;
}
