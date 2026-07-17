'use client';

import { useEffect, useState } from 'react';

const links = [
  { label: 'Album', href: '/', width: '62%' },
  { label: 'Archive', href: '#signal-tools', width: '78%' },
  { label: 'About', href: '#about', width: '48%' },
  { label: 'Transmission', href: '#contact', width: '92%' },
];

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 72);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="pointer-events-none fixed inset-x-0 top-0 z-[60] px-4 py-4 lg:px-7">
      <div className="mx-auto flex max-w-[1500px] items-start justify-between gap-4">
        <a
          href="/"
          aria-label="DELIX album"
          className={`pointer-events-auto flex items-center rounded-full border border-white/12 bg-black/45 px-4 py-2 shadow-[0_12px_45px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-500 ${
            isScrolled ? 'scale-90 opacity-70' : ''
          }`}
        >
          <img src="/images/LOGO.png" alt="DELIX" className="h-9 w-auto lg:h-11" />
        </a>

        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
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
              onClick={() => setIsMenuOpen((open) => !open)}
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

          <div
            className={`origin-top-right w-[min(88vw,430px)] overflow-hidden transition-all duration-300 ${
              isMenuOpen ? 'pointer-events-auto max-h-96 translate-y-0 p-2 opacity-100' : 'pointer-events-none max-h-0 -translate-y-2 p-0 opacity-0'
            }`}
          >
            <div className="rounded-2xl border border-cyan-100/18 bg-black/72 p-2 shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
              <div className="mb-1 flex items-center justify-between border-b border-white/10 px-3 py-2 text-[9px] uppercase tracking-[0.24em] text-cyan-100/45">
                <span>Flight console</span>
                <span>01 / 04</span>
              </div>
              <div className="px-3 pb-4 pt-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-cyan-100/50">
                  Recovered signal / DELIX IP
                </p>
                <h2 className="mt-2 max-w-[260px] text-xl font-black leading-[0.95] text-white">
                  Each planet is a song world.
                </h2>
                <p className="mt-3 max-w-[280px] text-xs leading-5 text-white/52">
                  Approach the worlds through orbit. Locked songs answer to signal tools found in the archive.
                </p>
                <p className="mt-3 text-[9px] uppercase tracking-[0.2em] text-white/35">
                  Scroll to enter orbit
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col items-end gap-3 px-1 pt-4">
              {links.map((link, index) => (
                <div key={link.label} style={{ width: link.width }}>
                  <a
                    href={link.href}
                    onClick={closeMenu}
                    className="group flex items-center justify-end gap-4 border-b border-white/15 px-3 py-3 text-right transition hover:border-cyan-100/60"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65 transition group-hover:text-cyan-50">
                      {link.label}
                    </span>
                    <span className="text-[9px] text-cyan-100/35 transition group-hover:text-cyan-100/70">
                      0{index + 1}
                    </span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
