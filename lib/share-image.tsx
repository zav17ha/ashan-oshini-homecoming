import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const shareSize = { width: 1200, height: 630 };

const read = (...p: string[]) => readFile(path.join(process.cwd(), "lib", ...p));

// The link preview WhatsApp shows: the couple's photo beside the guest's name in gold.
export async function renderShareImage(guest: string) {
  const [pinyon, cinzel, sinhala, photo] = await Promise.all([
    read("og-fonts", "pinyon.ttf"),
    read("og-fonts", "cinzel.ttf"),
    read("og-fonts", "sinhala.ttf"),
    read("og-assets", "couple.jpg"),
  ]);
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;
  const name = guest || "Our Beloved Guest";
  const nameSize = name.length > 30 ? 52 : name.length > 20 ? 64 : 80;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#3a0711" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoSrc} width={480} height={630} style={{ objectFit: "cover" }} alt="" />
        <div
          style={{
            flex: 1, display: "flex", padding: 34,
            background: "radial-gradient(circle at 50% 40%, #7e1b2d 0%, #3a0711 70%)",
          }}
        >
          <div
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              border: "2px solid #c9a24e",
              textAlign: "center", padding: "0 30px",
            }}
          >
            <div style={{ fontFamily: "Cinzel", fontSize: 22, letterSpacing: 7, color: "#c9a24e" }}>
              A HOMECOMING INVITATION FOR
            </div>
            <div style={{ fontFamily: "Pinyon, Sinhala", fontSize: nameSize, color: "#f4dea0", lineHeight: 1.2, marginTop: 18 }}>
              {name}
            </div>
            <div style={{ width: 220, height: 1, background: "#c9a24e", margin: "26px 0 20px" }} />
            <div style={{ fontFamily: "Pinyon", fontSize: 54, color: "#fbf6ec" }}>Ashan &amp; Oshini</div>
            <div style={{ fontFamily: "Cinzel", fontSize: 26, letterSpacing: 8, color: "#c9a24e", marginTop: 14 }}>
              18 · 12 · 2026
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...shareSize,
      fonts: [
        { name: "Pinyon", data: pinyon, style: "normal", weight: 400 },
        { name: "Cinzel", data: cinzel, style: "normal", weight: 500 },
        { name: "Sinhala", data: sinhala, style: "normal", weight: 500 },
      ],
    }
  );
}
