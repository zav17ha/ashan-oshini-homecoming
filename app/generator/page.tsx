import type { Metadata } from "next";
import Generator from "@/components/Generator";

export const metadata: Metadata = {
  title: "Guest Link Studio · Ashan & Oshini",
  robots: { index: false, follow: false },
};

export default function GeneratorPage() {
  return <Generator />;
}
