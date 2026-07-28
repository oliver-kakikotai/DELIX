'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { albumData } from '@/data/albumData';
import { signalTools } from '@/components/cosmic-voyage/data';
import { useUnlock } from '@/contexts/UnlockContext';

const links = [
  { label: 'Album', href: '/' },
  // /#signal-tools (not a bare #signal-tools) so this still navigates back
  // to the homepage section from other pages like /song/[slug], instead of
  // trying to scroll to an anchor that doesn't exist on the current page.
  { label: 'Archive', href: '/#signal-tools' },
];

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // Which keyframe animation the flight console should play. Stays `null`
  // until the first toggle so the close keyframes don't play on mount.
  const [menuAnimation, setMenuAnimation] = useState<'open' | 'close' | null>(null);
  const { checkUnlock, checkToolCollected } = useUnlock();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 72);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((open) => {
      setMenuAnimation(open ? 'close' : 'open');
      return !open;
    });
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setMenuAnimation('close');
  };

  const unlockedCount = albumData.songs.filter((song) => checkUnlock(song.id)).length;
  const collectedCount = signalTools.filter((tool) => checkToolCollected(tool.id)).length;

  return (
    <nav className="pointer-events-none fixed inset-x-0 top-0 z-[60]">
      <div className="px-4 py-4 lg:px-7">
        <div className="mx-auto flex max-w-[1500px] items-start justify-between gap-4">
          <Link
            href="/"
            aria-label="DELIX album"
            className={`pointer-events-auto flex items-center rounded-full border border-white/12 bg-black/45 px-4 py-2 shadow-[0_12px_45px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-500 ${
              isScrolled ? 'scale-90 opacity-70' : ''
            }`}
          >
            <Image
              src="/images/LOGO.png"
              alt="DELIX"
              width={1170}
              height={1118}
              priority
              className="h-9 w-auto lg:h-11"
            />
          </Link>

          <div className="pointer-events-auto flex items-center gap-2">
            <div
              className={`hidden items-center gap-2 rounded-full border border-cyan-100/15 bg-black/40 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.24em] text-cyan-100/60 backdrop-blur-xl transition-all duration-500 sm:flex ${
                isScrolled ? 'translate-x-3 opacity-0' : 'opacity-100'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />
              Orbit online
            </div>

            <button
              type="button"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
              onClick={toggleMenu}
              className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-cyan-100/25 bg-black/55 text-cyan-50 shadow-[0_10px_35px_rgba(0,0,0,0.4)] backdrop-blur-xl transition hover:border-cyan-100/60 hover:bg-cyan-100/10"
            >
              <span className="absolute inset-1 rounded-full border border-white/10" />
              <span className="relative flex h-4 w-4 items-center justify-center">
                <span className={`absolute h-px w-4 bg-current transition-transform duration-300 ${isMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
                <span className={`absolute h-px w-4 bg-current transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                <span className={`absolute h-px w-4 bg-current transition-transform duration-300 ${isMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-width flight console — a single shape, not a line handing off
          to a separate panel. It's a thin 1/3-page-wide acid line for the
          first part of the open animation (height still collapsed), then
          thickens into the full panel — one continuous morph, defined by
          the nav-panel-open/close keyframes in globals.css so opening and
          closing are mirror images instead of two independently-timed
          transitions. `menuAnimation` only gets set after the first toggle
          so this doesn't play the close keyframes on initial mount. */}
      <div
        className={`w-full origin-center overflow-hidden border-b border-black/10 bg-[#D9FF12] shadow-[0_30px_90px_rgba(0,0,0,0.45)] ${
          isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        } ${
          menuAnimation === 'open'
            ? '[animation:nav-panel-open_550ms_ease-out_forwards]'
            : menuAnimation === 'close'
              ? '[animation:nav-panel-close_450ms_ease-out_forwards]'
              : 'scale-x-0 [clip-path:inset(0_0_100%_0)]'
        }`}
      >
        <div
          className={`mx-auto grid max-w-[1500px] grid-cols-1 gap-8 px-5 py-10 md:grid-cols-3 md:gap-10 lg:px-7 transition-opacity ${
            isMenuOpen ? 'opacity-100 duration-200 delay-[380ms]' : 'opacity-0 duration-150'
          }`}>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-black/55">
              Flight console / DELIX IP
            </p>
            <h2 className="mt-3 max-w-xs text-2xl font-black leading-[0.95] text-black">
              Each planet is a song world.
            </h2>
            <p className="mt-4 max-w-xs text-xs leading-6 text-black/65">
              Approach the worlds through orbit. Locked songs answer to signal tools found in the archive.
            </p>
          </div>

          <div>
            <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.28em] text-black/55">Navigate</p>
            <div className="flex flex-col gap-1">
              {links.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={closeMenu}
                  className="group flex items-center gap-4 border-b border-black/15 py-3 transition hover:border-black/60"
                >
                  <span className="text-[9px] text-black/40 transition group-hover:text-black/80">
                    0{index + 1}
                  </span>
                  <span className="text-sm font-semibold uppercase tracking-[0.2em] text-black/75 transition group-hover:text-black">
                    {link.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.28em] text-black/55">Archive Status</p>
            <div className="space-y-2 text-xs text-black/70">
              <div className="flex justify-between"><span>Song worlds</span><span>{unlockedCount}/{albumData.totalSongs}</span></div>
              <div className="flex justify-between"><span>Signal tools</span><span>{collectedCount}/{signalTools.length}</span></div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
