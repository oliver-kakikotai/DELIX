'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

type IconLink = {
  name: string;
  href: string;
  icon: ReactNode;
};

const iconClass = 'h-5 w-5';

function SpotifyIcon() {
  return (
    <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.38-1.32 9.78-.66 13.5 1.62.36.18.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z" />
    </svg>
  );
}

function AppleMusicIcon() {
  return (
    <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.9 2.2c-.5-.4-1.1-.5-1.8-.4L8.6 3.6c-1 .2-1.6.9-1.6 1.9v10.4c-.5-.2-1.1-.3-1.7-.2-1.8.2-3.2 1.5-3.2 3 0 1.6 1.7 2.7 3.7 2.4 1.8-.2 3.2-1.5 3.2-3V8.2l10-1.7v7.7c-.5-.2-1.1-.3-1.7-.2-1.8.2-3.2 1.5-3.2 3 0 1.6 1.7 2.7 3.7 2.4 1.8-.2 3.2-1.5 3.2-3V3.8c0-.7-.3-1.2-.8-1.6z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.5 6.15A3.02 3.02 0 0 0 21.38 4c-1.8-.48-8.75-.5-9.34-.5h-.08c-.59 0-7.54.02-9.34.5A3.02 3.02 0 0 0 .5 6.15C.08 7.76.01 10.85 0 11.75v.5c.01.9.08 3.99.5 5.6A3.02 3.02 0 0 0 2.62 20c1.75.47 8.44.5 9.29.5h.17c.85 0 7.54-.03 9.3-.5a3.02 3.02 0 0 0 2.12-2.15c.47-1.77.5-5.37.5-5.8V12s0-3.95-.5-5.85zM9.54 15.58V8.4L15.82 12l-6.28 3.58z" />
    </svg>
  );
}

function SoundCloudIcon() {
  return (
    <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.4 10.8c-.4 0-.8.06-1.16.18A6.08 6.08 0 0 0 5.5 9.1c-.54.1-.94.57-.94 1.14v7.02c0 .45.36.82.82.82H18.4a3.64 3.64 0 0 0 0-7.28zM1.2 13.1c-.06 0-.11.05-.12.11L.84 15.4l.24 2.15c.01.06.06.1.12.1.05 0 .1-.04.11-.1l.27-2.15-.27-2.19c-.01-.06-.06-.11-.11-.11zm1.14-.8c-.06 0-.11.05-.12.11l-.3 2.99.3 2.86c.01.06.06.11.12.11s.11-.05.12-.11l.34-2.86-.34-2.99c-.01-.06-.06-.11-.12-.11zm1.16-.46c-.06 0-.11.05-.12.11l-.3 3.45.3 3.12c.01.07.06.11.12.11s.11-.04.12-.11l.34-3.12-.34-3.45c-.01-.06-.06-.11-.12-.11z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.69.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.36-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.36-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.9 2h3.68l-8.04 9.19L24 22h-7.4l-5.8-7.58L4.17 22H.5l8.6-9.83L0 2h7.6l5.23 6.91L18.9 2zm-1.29 18.1h2.04L6.5 3.8H4.31L17.6 20.1z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.01-2.77V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 1 0 15.86 15.67v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4c-.35 0-.7-.03-1.04-.1z" />
    </svg>
  );
}

export default function Footer() {
  const { currentLanguage } = useLanguage();

  const translations = {
    subtitle: {
      en: 'A musical archive drifting through locked worlds and recovered signals.',
      zh: '一座漂浮在锁定星球与回收信号之间的音乐档案。',
      ja: 'ロックされた世界と回収された信号を漂う音楽アーカイブ。'
    },
    transmissions: {
      en: 'Listen',
      zh: '收听',
      ja: '聴く'
    },
    coordinates: {
      en: 'Orbit',
      zh: '轨道',
      ja: '軌道'
    },
    copyright: {
      en: '© 2026 Runaway Rabbit. DELIX cosmic album archive.',
      zh: '© 2026 Runaway Rabbit. DELIX 宇宙专辑档案。',
      ja: '© 2026 Runaway Rabbit. DELIX cosmic album archive.'
    },
    signal: {
      en: 'FINAL TRANSMISSION',
      zh: '最终信号',
      ja: '最終信号'
    }
  };

  const t = (key: keyof typeof translations) =>
    translations[key][currentLanguage as keyof (typeof translations)[typeof key]];

  const musicPlatforms: IconLink[] = [
    { name: 'Spotify', href: '#', icon: <SpotifyIcon /> },
    { name: 'Apple Music', href: '#', icon: <AppleMusicIcon /> },
    { name: 'YouTube Music', href: '#', icon: <YouTubeIcon /> },
    { name: 'SoundCloud', href: '#', icon: <SoundCloudIcon /> },
  ];

  const socialLinks: IconLink[] = [
    { name: 'Instagram', href: '#', icon: <InstagramIcon /> },
    { name: 'X', href: '#', icon: <TwitterIcon /> },
    { name: 'TikTok', href: '#', icon: <TikTokIcon /> },
  ];

  return (
    <footer className="relative z-10 overflow-hidden bg-black text-white">
      {/* top entry line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
      {/* subtle glow behind the big type */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_60%,rgba(100,120,255,0.10),transparent_50%)]" />

      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        {/* ── Giant headline ── */}
        <div className="overflow-hidden border-b border-white/[0.07] px-4 pb-2 pt-14 md:px-8">
          <motion.h2
            className="select-none font-black leading-[0.82] tracking-tight text-white"
            style={{ fontSize: 'clamp(4.5rem, 17vw, 16rem)' }}
            initial={{ y: '18%', opacity: 0 }}
            whileInView={{ y: '0%', opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            DELIX
          </motion.h2>
        </div>

        {/* ── Tagline + links row ── */}
        <div className="flex flex-col gap-6 px-4 pb-10 pt-7 md:flex-row md:items-end md:justify-between md:px-8">
          {/* Tagline */}
          <p className="max-w-xs text-sm leading-7 text-white/44 md:max-w-sm">
            {t('subtitle')}
          </p>

          {/* Right: platforms + socials */}
          <div className="flex flex-col items-start gap-4 md:items-end">
            {/* Music platforms — horizontal pills */}
            <div className="flex flex-wrap gap-2">
              {musicPlatforms.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.href}
                  aria-label={platform.name}
                  className="group flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[11px] font-semibold text-white/48 transition duration-300 hover:border-white/26 hover:bg-white/[0.08] hover:text-white"
                >
                  {platform.icon}
                  <span className="group-hover:text-white/86 transition">{platform.name}</span>
                </a>
              ))}
            </div>
            {/* Social icons */}
            <div className="flex items-center gap-2">
              <span className="mr-1 text-[9px] font-semibold uppercase tracking-[0.26em] text-white/28">
                {t('coordinates')}
              </span>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/46 transition duration-300 hover:border-white/28 hover:text-white"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Copyright strip ── */}
        <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-4 text-[10px] uppercase tracking-[0.22em] text-white/24 md:px-8">
          <p>{t('copyright')}</p>
          <div className="flex items-center gap-2">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-cyan-200/50"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span>SIGNAL STABLE</span>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
