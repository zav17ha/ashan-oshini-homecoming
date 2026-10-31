import type { Metadata } from "next";
import Responses from "@/components/Responses";

export const metadata: Metadata = {
  title: "Guest Replies · Ashan & Oshini",
  robots: { index: false, follow: false },
};

export default function ResponsesPage() {
  return <Responses />;
}
