'use client';

export default function RotatingPlanet() {
  return (
    <section className="flex h-full min-h-[220px] items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-white backdrop-blur">
      <div className="relative h-36 w-36 rounded-full bg-gradient-to-br from-purple-400 via-blue-500 to-cyan-300 shadow-[0_0_60px_rgba(96,165,250,0.45)] animate-spin" />
    </section>
  );
}
