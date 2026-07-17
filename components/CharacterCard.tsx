'use client';

export default function CharacterCard() {
  return (
    <section
      id="character"
      className="h-full min-h-[220px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-white backdrop-blur"
    >
      <div className="relative h-full min-h-[220px]">
        <img
          src="/images/profile.jpg"
          alt="Runaway Rabbit profile"
          className="absolute inset-0 h-full w-full rounded-xl object-cover opacity-70"
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black via-black/25 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">Character</p>
          <h2 className="mt-1 text-2xl font-bold">DELIX</h2>
        </div>
      </div>
    </section>
  );
}
