"use client";

import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import Envelope from "./Envelope";
import Collage from "./Collage";
import Rsvp from "./Rsvp";
import { Celebration, GoldDust } from "./effects";
import { Countdown, Farewell, Footer, Hero, Letter, SaveTheDate, Unveil, Venue } from "./Sections";

type Stage = "sealed" | "opening" | "open";

export default function Invitation({ guest, code = "" }: { guest: string; code?: string }) {
  const [stage, setStage] = useState<Stage>("sealed");

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="inv" data-opened={stage !== "sealed"}>
        {stage !== "open" && (
          <Envelope
            guest={guest}
            onOpening={() => {
              window.scrollTo(0, 0);
              setStage("opening");
            }}
            onOpened={() => setStage("open")}
          />
        )}
        <GoldDust />
        <Celebration />
        <main>
          <Hero />
          <Letter guest={guest} />
          <Countdown />
          <Collage />
          <Unveil />
          <SaveTheDate />
          <Venue />
          <Rsvp guest={guest} code={guest ? code : ""} />
          <Farewell guest={guest} />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
