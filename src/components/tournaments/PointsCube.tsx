import { cn } from "@/lib/cn";

const FACES = [
  "translateZ(var(--h))",
  "rotateY(180deg) translateZ(var(--h))",
  "rotateY(90deg) translateZ(var(--h))",
  "rotateY(-90deg) translateZ(var(--h))",
  "rotateX(90deg) translateZ(var(--h))",
  "rotateX(-90deg) translateZ(var(--h))",
];

function Cube({ size, inner }: { size: number; inner?: boolean }) {
  return (
    <>
      {FACES.map((t) => (
        <div
          key={t}
          className={cn(
            "absolute inset-0 box-border border",
            inner ? "border-lime bg-lime/[0.12]" : "border-lime/70 bg-lime/[0.05]",
          )}
          style={{ transform: t, ["--h" as string]: `${size / 2}px` }}
        />
      ))}
    </>
  );
}

/**
 * "Ball tizimi" art: an 88px holo cube with a solid 40px core, spinning (CSS 3D, port of the
 * mockup). Decorative; the caller renders the label as real text.
 */
export default function PointsCube() {
  return (
    <div aria-hidden="true" className="relative size-[88px] [transform-style:preserve-3d]">
      <div className="absolute inset-0 animate-spin-cube [transform-style:preserve-3d]" style={{ transform: "rotateX(-20deg) rotateY(35deg)" }}>
        <Cube size={88} />
        <div className="absolute left-6 top-6 size-10 [transform-style:preserve-3d]">
          <Cube size={40} inner />
        </div>
      </div>
    </div>
  );
}
