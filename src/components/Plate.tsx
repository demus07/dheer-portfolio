import Image from "next/image";
import type { DrawingKind, Tone } from "@/content/site";
import { Drawing } from "./Drawing";
import { Fill } from "./Fill";

// An image slot. Without `src` it shows a line drawing and says what belongs there.
export function Plate({
  kind,
  label,
  ratio = "4 / 5",
  tone = "ink",
  src,
}: {
  kind: DrawingKind;
  label: string;
  ratio?: string;
  tone?: Tone;
  src?: string;
}) {
  return (
    <figure className={`plate tone-${tone}`}>
      <div className="plate__frame" style={{ aspectRatio: ratio }}>
        {src ? <Image src={src} alt={label} fill sizes="100vw" /> : <Drawing kind={kind} />}
      </div>
      <figcaption className="label">
        <Fill>{label}</Fill>
      </figcaption>
    </figure>
  );
}
