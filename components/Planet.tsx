'use client';

interface PlanetProps {
  className?: string;
  alt?: string;
}

// Two-layer planet: yellow base stays fixed, surface pattern self-scrolls.
// Sizing/positioning is fully controlled by the parent via `className`.
export default function Planet({ className = '', alt = 'Planet' }: PlanetProps) {
  return (
    <div className={`relative overflow-hidden rounded-full ${className}`}>
      <img
        src="/images/planet%20root1.png"
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="planet-pattern-strip absolute inset-0 flex h-full w-[300%]">
        <img
          src="/images/planetpattern.PNG"
          alt=""
          aria-hidden="true"
          className="h-full w-1/3 flex-shrink-0 object-cover"
        />
        <img
          src="/images/planetpattern.PNG"
          alt=""
          aria-hidden="true"
          className="h-full w-1/3 flex-shrink-0 object-cover"
        />
        <img
          src="/images/planetpattern.PNG"
          alt=""
          aria-hidden="true"
          className="h-full w-1/3 flex-shrink-0 object-cover"
        />
      </div>
    </div>
  );
}
