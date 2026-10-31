import { renderShareImage, shareSize } from "@/lib/share-image";

export const runtime = "nodejs";
export const alt = "Ashan & Oshini homecoming invitation";
export const size = shareSize;
export const contentType = "image/png";

export default function Image() {
  return renderShareImage("");
}
