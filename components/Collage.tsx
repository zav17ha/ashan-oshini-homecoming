"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

type Tile = { key: string; src: string; alt: string; pos: string; drift: number; delay: number };

// All photos from the red gown session.
const TILES: Tile[] = [
  { key: "a", src: "/images/stables.jpg", alt: "Ashan and Oshini at the doors of The Stables, Chatham Street", pos: "50% 60%", drift: -24, delay: 0 },
  { key: "b", src: "/images/colonnade.jpg", alt: "Ashan and Oshini among white colonial arches", pos: "50% 60%", drift: 18, delay: 0.15 },
  { key: "c", src: "/images/bench.jpg", alt: "Ashan and Oshini seated back to back on a stone bench", pos: "40% 70%", drift: -20, delay: 0.3 },
  { key: "d", src: "/images/street-walk.jpg", alt: "Ashan and Oshini walking arm in arm past The Stables", pos: "55% 72%", drift: 22, delay: 0.1 },
  { key: "e", src: "/images/colonnade-lean.jpg", alt: "Oshini leaning on a white pillar with Ashan beside her under the arched colonnade", pos: "40% 90%", drift: -16, delay: 0.25 },
];

function Photo({ tile, progress }: { tile: Tile; progress: MotionValue<number> }) {
  const y = useTransform(progress, [0, 1], [tile.drift, -tile.drift]);
  return (
    <motion.figure
      className={`tile tile-${tile.key}`}
      style={{ y }}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div
        className="tile-frame"
        variants={{ hidden: { clipPath: "inset(100% 0% 0% 0%)" }, shown: { clipPath: "inset(0% 0% 0% 0%)" } }}
        transition={{ duration: 1.4, ease: [0.7, 0, 0.2, 1], delay: tile.delay }}
      >
        <motion.div
          className="tile-zoom"
          variants={{ hidden: { scale: 1.35 }, shown: { scale: 1 } }}
          transition={{ duration: 2.2, ease: [0.2, 0.7, 0.2, 1], delay: tile.delay }}
        >
          <div className="tile-kb" style={{ animationDelay: `${tile.delay * -20}s` }}>
            <Image src={tile.src} alt={tile.alt} fill quality={90} sizes="(min-width: 820px) 40vw, 60vw" style={{ objectPosition: tile.pos }} />
          </div>
        </motion.div>
      </motion.div>
    </motion.figure>
  );
}

export default function Collage() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section ref={ref} className="collage" aria-label="Our moments">
      <div className="collage-grid wrap">
        {TILES.slice(0, 3).map((t) => <Photo key={t.key} tile={t} progress={scrollYProgress} />)}
        <motion.div
          className="tile tile-t"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <span className="eyebrow light">Our moments</span>
          <h2 className="script gold-text collage-title">Captured</h2>
        </motion.div>
        {TILES.slice(3).map((t) => <Photo key={t.key} tile={t} progress={scrollYProgress} />)}
      </div>
    </section>
  );
}
