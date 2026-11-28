// Twinkling star field drawn as a few SVG layers instead of one animated DOM
// element per star.
//
// Perf: every individually-animated star became its own compositor layer
// (96 on the homepage, 38 on song pages), all re-composited every frame for
// the whole page. Measured on a 2x / 120Hz display, that plus the planet
// glows was the main source of dropped frames in the planet section.
// Here stars are split into a few groups; each group is one SVG whose
// opacity is animated in CSS (`.starfield-group` in globals.css) — so it's
// one layer per group, still twinkling, just in sync within a group.
//
// Stars are small squares (0.75–2.25 px), the same grains as RockDust around
// the 3D rock and the particle song titles (ParticleTitle), so the whole page
// reads as one field of star dust.

export type Star = {
  left: number; // %
  top: number; // %
  size: number; // px
  opacity: number; // base opacity, 0–1
};

const GROUP_TIMINGS = [
  { duration: 3.6, delay: 0 },
  { duration: 4.8, delay: 1.3 },
  { duration: 6.2, delay: 2.6 },
];

export default function StarField({ stars, className = '' }: { stars: Star[]; className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {GROUP_TIMINGS.map((timing, g) => (
        <svg
          key={g}
          className="starfield-group absolute inset-0 h-full w-full"
          style={{ animationDuration: `${timing.duration}s`, animationDelay: `${timing.delay}s` }}
        >
          {stars.map((star, i) =>
            i % GROUP_TIMINGS.length === g ? (
              <rect
                key={i}
                x={`${star.left}%`}
                y={`${star.top}%`}
                width={star.size * 0.75}
                height={star.size * 0.75}
                fill="#fff"
                fillOpacity={star.opacity}
              />
            ) : null
          )}
        </svg>
      ))}
    </div>
  );
}
