import { renderShareImage, shareSize } from "@/lib/share-image";
import { decodeGuest } from "@/lib/guest";

export const runtime = "nodejs";
export const alt = "Your personal homecoming invitation from Ashan & Oshini";
export const size = shareSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  return renderShareImage(decodeGuest((await params).code));
}
