import type { Metadata } from "next";
import Invitation from "@/components/Invitation";
import { decodeGuest } from "@/lib/guest";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guest = decodeGuest((await params).code);
  if (!guest) return {};
  return {
    title: `Invitation for ${guest} · Ashan & Oshini`,
    openGraph: {
      title: `${guest}, you're invited to our homecoming`,
      description: "Ashan & Oshini · Homecoming · 18 December 2026 · Tap to open your personal invitation.",
    },
    robots: { index: false, follow: false },
  };
}

export default async function GuestInvitation({ params }: Props) {
  const { code } = await params;
  return <Invitation guest={decodeGuest(code)} code={code} />;
}
