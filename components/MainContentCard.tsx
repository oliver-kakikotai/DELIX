'use client';

interface MainContentCardProps {
  onExploreClick?: () => void;
  onViewWorksClick?: () => void;
}

export default function MainContentCard({
  onExploreClick,
  onViewWorksClick,
}: MainContentCardProps) {
  return (
    <section className="h-full min-h-[420px] rounded-2xl border border-white/10 bg-black/45 p-8 text-white shadow-2xl backdrop-blur">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-purple-300">
        Original IP Universe
      </p>
      <h1 className="mb-5 text-4xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 lg:text-6xl">
        Runaway Rabbit
      </h1>
      <p className="max-w-2xl text-base leading-8 text-white/72 lg:text-lg">
        A character world built from music, motion, visual art, and story fragments.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onExploreClick}
          className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-purple-100"
        >
          Explore Character
        </button>
        <button
          type="button"
          onClick={onViewWorksClick}
          className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/60"
        >
          View Works
        </button>
      </div>
    </section>
  );
}
