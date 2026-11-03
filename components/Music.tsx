"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SRC = "/music/a-thousand-years.mp3";

/** Ask the player to start. Call it straight from a tap so phones allow sound. */
export function startMusic() {
  window.dispatchEvent(new Event("music:start"));
}

/** Background song with a small gold button to pause and resume it. */
export default function Music({ visible }: { visible: boolean }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const wanted = useRef(false); // what the guest chose, so we resume after they switch apps

  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    const fadeIn = () => {
      el.volume = 0;
      const t0 = performance.now();
      const step = (t: number) => {
        el.volume = Math.min(0.7, ((t - t0) / 2500) * 0.7);
        if (el.volume < 0.7 && !el.paused) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const start = () => {
      wanted.current = true;
      el.play().then(fadeIn).catch(() => setPlaying(false));
    };
    const onVisibility = () => {
      if (document.hidden) el.pause();
      else if (wanted.current) el.play().catch(() => {});
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    window.addEventListener("music:start", start);
    document.addEventListener("visibilitychange", onVisibility);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      window.removeEventListener("music:start", start);
      document.removeEventListener("visibilitychange", onVisibility);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, []);

  function toggle() {
    const el = audio.current;
    if (!el) return;
    if (el.paused) {
      wanted.current = true;
      el.volume = 0.7;
      el.play().catch(() => {});
    } else {
      wanted.current = false;
      el.pause();
    }
  }

  return (
    <>
      <audio ref={audio} src={SRC} loop preload="none" />
      <AnimatePresence>
        {visible && (
          <motion.button
            type="button"
            className={`music-btn${playing ? " on" : ""}`}
            onClick={toggle}
            aria-label={playing ? "Pause music" : "Play music"}
            aria-pressed={playing}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <span className="music-disc" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></svg>
            </span>
            <span className="music-bars" aria-hidden="true"><i /><i /><i /></span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
