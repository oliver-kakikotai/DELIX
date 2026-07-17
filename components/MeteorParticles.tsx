'use client';

interface MeteorParticlesProps {
  isActive: boolean;
}

export default function MeteorParticles({ isActive }: MeteorParticlesProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`absolute h-px w-24 -rotate-45 bg-gradient-to-r from-transparent via-white to-transparent transition-opacity duration-700 ${
            isActive ? 'opacity-70' : 'opacity-0'
          }`}
          style={{
            top: `${12 + i * 14}%`,
            left: `${8 + i * 15}%`,
            animation: isActive ? `meteor-drift ${2.4 + i * 0.25}s linear infinite` : undefined,
            animationDelay: `${i * 0.35}s`,
          }}
        />
      ))}
    </div>
  );
}
