'use client';

import Image from 'next/image';

interface PlanetProps {
  className?: string;
  alt?: string;
}

// Generic fallback planet for songs without their own planetImage — same
// asset used as the fallback elsewhere (see songPlanetImage in
// CosmicVoyage.tsx). Sizing/positioning is fully controlled by the parent
// via `className`.
export default function Planet({ className = '', alt = 'Planet' }: PlanetProps) {
  return (
    <div className={`relative overflow-hidden rounded-full ${className}`}>
      <Image
        src="/images/planet1.png"
        alt={alt}
        fill
        sizes="(max-width: 768px) 40vw, 300px"
        className="object-cover"
      />
    </div>
  );
}
