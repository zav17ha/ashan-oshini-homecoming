import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteUrl } from "@/lib/wedding";
import "./globals.css";

const script = localFont({
  src: "./fonts/pinyon.woff2",
  variable: "--font-script",
  display: "swap",
});
const caps = localFont({
  src: [
    { path: "./fonts/cinzel-400.woff2", weight: "400" },
    { path: "./fonts/cinzel-500.woff2", weight: "500" },
    { path: "./fonts/cinzel-600.woff2", weight: "600" },
  ],
  variable: "--font-caps",
  display: "swap",
});
const serif = localFont({
  src: [
    { path: "./fonts/cormorant-400.woff2", weight: "400" },
    { path: "./fonts/cormorant-500.woff2", weight: "500" },
    { path: "./fonts/cormorant-600.woff2", weight: "600" },
    { path: "./fonts/cormorant-400i.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Ashan & Oshini · Homecoming · 18.12.2026",
  description: "You are warmly invited to the homecoming of Ashan & Oshini on 18 December 2026.",
  openGraph: {
    type: "website",
    title: "Ashan & Oshini · Homecoming · 18.12.2026",
    description: "You are warmly invited to our homecoming. Tap to open your invitation.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#3a0711",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${script.variable} ${caps.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
