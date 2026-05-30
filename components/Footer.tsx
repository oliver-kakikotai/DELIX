'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { currentLanguage } = useLanguage();

  const translations = {
    title: {
      en: 'DELIX',
      zh: 'DELIX',
      ja: 'DELIX'
    },
    subtitle: {
      en: 'A Musical Journey Through Space',
      zh: '穿越宇宙的音乐之旅',
      ja: '宇宙を巡る音楽の旅'
    },
    coordinates: {
      en: 'STELLAR COORDINATES',
      zh: '星际坐标',
      ja: '星間座標'
    },
    transmissions: {
      en: 'TRANSMISSIONS',
      zh: '信号传输',
      ja: '信号伝送'
    },
    links: {
      en: 'NAVIGATION',
      zh: '导航系统',
      ja: 'ナビゲーション'
    },
    copyright: {
      en: '© 2024 Runaway Rabbit. All rights reserved.',
      zh: '© 2024 Runaway Rabbit. 版权所有。',
      ja: '© 2024 Runaway Rabbit. 全著作権所有。'
    },
    status: {
      en: 'SYSTEM STATUS: OPERATIONAL',
      zh: '系统状态：运行中',
      ja: 'システムステータス：稼働中'
    },
    privacy: {
      en: 'Privacy Policy',
      zh: '隐私政策',
      ja: 'プライバシーポリシー'
    },
    terms: {
      en: 'Terms of Service',
      zh: '服务条款',
      ja: '利用規約'
    },
    contact: {
      en: 'Contact',
      zh: '联系我们',
      ja: 'お問い合わせ'
    }
  };

  const t = (key: keyof typeof translations) =>
    translations[key][currentLanguage as keyof (typeof translations)[typeof key]];

  // 音乐平台链接
  const musicPlatforms = [
    {
      name: 'Spotify',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      ),
      url: '#',
      color: 'hover:text-green-400 hover:border-green-400/50'
    },
    {
      name: 'Apple Music',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 0 0-1.595-.706 10.95 10.95 0 0 0-2.314-.05c-1.713.09-3.373.28-5.03.548-1.631.263-3.262.545-4.888.86-.9.175-1.767.386-2.565.765-1.03.49-1.706 1.245-2.078 2.363-.12.362-.21.734-.27 1.117a22.96 22.96 0 0 0-.138 2.292c-.01 2.266.013 4.532.054 6.797.02 1.05.054 2.098.135 3.143.063.805.202 1.588.54 2.315.495 1.063 1.296 1.743 2.434 2.1a5.028 5.028 0 0 0 1.913.233c1.584-.054 3.124-.264 4.662-.493 1.737-.258 3.467-.55 5.203-.798.888-.127 1.787-.24 2.663-.465.96-.246 1.746-.698 2.304-1.516.405-.593.622-1.28.714-2.007.105-.829.148-1.671.177-2.514.065-1.87.09-3.741.09-5.613 0-.493-.002-.986-.005-1.479zm-8.54 6.182c-.01.697-.01 1.394-.01 2.092 0 .43-.013.858-.05 1.286a2.976 2.976 0 0 1-.496 1.477c-.474.68-1.16.99-1.952.99a3.449 3.449 0 0 1-1.888-.548 3.045 3.045 0 0 1-1.374-1.587 3.482 3.482 0 0 1-.184-1.308c.014-.943.403-1.708 1.16-2.278a3.55 3.55 0 0 1 2.196-.754c.422.014.83.09 1.212.25.29.121.54.29.735.524.17.204.29.437.367.698.09.304.13.618.144.935.01.162.01.325.01.488v.926h-.003zm5.303-5.928a1.162 1.162 0 0 1-.036.427c-.098.396-.323.72-.665.954a2.13 2.13 0 0 1-1.09.368c-.378.01-.755-.01-1.13-.065a9.472 9.472 0 0 1-1.733-.367 2.624 2.624 0 0 1-.87-.437 1.075 1.075 0 0 1-.383-.83c-.014-.742-.014-1.485-.014-2.228 0-1.677.014-3.354.027-5.03v-.465c0-.113.014-.226.036-.338a1.069 1.069 0 0 1 .735-.86 2.145 2.145 0 0 1 1.012-.113c.378.036.742.113 1.09.233.378.13.742.28 1.09.437.257.117.502.25.728.41.29.202.502.465.622.787.105.282.144.577.144.874.014 1.514.014 3.028.014 4.542v1.677z"/>
        </svg>
      ),
      url: '#',
      color: 'hover:text-pink-400 hover:border-pink-400/50'
    },
    {
      name: 'YouTube Music',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.04 3.5c.59 0 7.54.02 9.34.5a3.02 3.02 0 0 1 2.12 2.15C24 8.05 24 12 24 12v.04c0 .43-.03 4.03-.5 5.8A3.02 3.02 0 0 1 21.38 20c-1.76.48-8.45.5-9.3.51h-.17c-.85 0-7.54-.03-9.29-.5A3.02 3.02 0 0 1 .5 17.84c-.42-1.61-.49-4.7-.5-5.6v-.5c.01-.9.08-3.99.5-5.6a3.02 3.02 0 0 1 2.12-2.15c1.8-.48 8.75-.5 9.34-.5h.08m-.02 2.5h-.04c-.86 0-7.7.02-9.25.45a.52.52 0 0 0-.37.37c-.38 1.37-.44 4.11-.45 5.02v.43c.01.91.07 3.65.45 5.02.05.17.2.32.37.37 1.55.43 8.39.45 9.25.45h.08c.86 0 7.7-.02 9.25-.45.17-.05.32-.2.37-.37.38-1.37.44-4.11.45-5.02v-.43c-.01-.91-.07-3.65-.45-5.02a.52.52 0 0 0-.37-.37c-1.55-.43-8.39-.45-9.25-.45h-.04M9.54 8.4v7.18L15.82 12 9.54 8.4z"/>
        </svg>
      ),
      url: '#',
      color: 'hover:text-red-400 hover:border-red-400/50'
    },
    {
      name: 'SoundCloud',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c0-.057-.045-.1-.09-.1m-.899.828c-.05 0-.09.04-.099.098l-.157 1.327.157 1.251c.009.057.045.099.099.099.05 0 .09-.042.099-.099l.178-1.251-.178-1.327c-.009-.057-.045-.098-.099-.098m1.753-.993c-.05 0-.094.04-.102.1l-.287 2.326.287 2.265c.008.058.05.1.102.1.05 0 .09-.04.099-.1l.323-2.265-.323-2.326c-.009-.06-.05-.1-.099-.1m.899-.066c-.051 0-.091.04-.102.099l-.255 2.392.255 2.336c.008.059.05.098.102.098.05 0 .09-.04.098-.098l.29-2.336-.29-2.392c-.009-.059-.045-.099-.098-.099m.899-.166c-.05 0-.09.04-.099.099l-.255 2.558.255 2.469c.009.058.05.098.099.098.05 0 .091-.04.1-.098l.287-2.469-.287-2.558c-.009-.059-.05-.099-.1-.099m.899-.111c-.05 0-.09.04-.099.098l-.255 2.669.255 2.581c.009.059.05.098.099.098.05 0 .091-.04.1-.098l.322-2.581-.322-2.669c-.009-.059-.05-.098-.1-.098m.83-.086c-.05 0-.091.04-.1.099l-.254 2.755.254 2.618c.009.058.05.098.1.098.05 0 .09-.04.099-.098l.288-2.618-.288-2.755c-.009-.059-.05-.099-.099-.099m.9-.19c-.051 0-.091.04-.1.098l-.255 2.945.255 2.7c.009.059.049.099.1.099.05 0 .09-.04.099-.099l.322-2.7-.322-2.945c-.009-.058-.05-.098-.099-.098m.899-.09c-.05 0-.091.04-.1.099l-.255 3.035.255 2.755c.009.059.05.099.1.099.05 0 .09-.04.099-.099l.322-2.755-.322-3.035c-.009-.059-.05-.099-.099-.099m.9-.05c-.051 0-.091.04-.1.098l-.255 3.084.255 2.788c.009.058.05.098.1.098.05 0 .09-.04.099-.098l.322-2.788-.322-3.084c-.009-.058-.05-.098-.099-.098m.899.238c-.05 0-.091.04-.1.099l-.254 2.846.254 2.799c.009.058.05.098.1.098.05 0 .09-.04.099-.098l.322-2.799-.322-2.846c-.009-.059-.05-.099-.099-.099m7.137-.081c-.18 0-.36.03-.537.09a6.08 6.08 0 0 0-11.592-1.768c-.056-.01-.113-.015-.17-.015-.504 0-.912.41-.912.914v6.206c0 .504.408.914.912.914h12.299c1.183 0 2.143-.96 2.143-2.143s-.96-2.143-2.143-2.143"/>
        </svg>
      ),
      url: '#',
      color: 'hover:text-orange-400 hover:border-orange-400/50'
    }
  ];

  // 社交媒体链接
  const socialLinks = [
    {
      name: 'Instagram',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      url: '#',
      color: 'hover:text-purple-400 hover:border-purple-400/50'
    },
    {
      name: 'Twitter',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      url: '#',
      color: 'hover:text-blue-400 hover:border-blue-400/50'
    },
    {
      name: 'TikTok',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
      url: '#',
      color: 'hover:text-pink-400 hover:border-pink-400/50'
    }
  ];

  return (
    <footer className="relative z-10 mt-0 pb-12 bg-black overflow-hidden">
      {/* 顶部扫描线动画 */}
      <div className="absolute top-0 left-0 w-full h-px overflow-hidden">
        <motion.div
          className="h-full w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>

      {/* HUD 风格边框 */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* 四个角的装饰 */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-500/50"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-500/50"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-500/50"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-500/50"></div>
      </div>

      {/* 背景网格效果 */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* 扫描线效果 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)'
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity
        }}
      />

      <div className="container mx-auto px-8 pt-16 relative z-10">
        {/* 顶部状态栏 */}
        <div className="mb-12">
          <motion.div
            className="flex items-center justify-between text-xs text-cyan-400 font-mono"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-green-400"
                animate={{
                  opacity: [1, 0.3, 1],
                  scale: [1, 0.8, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              />
              <span>{t('status')}</span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <span>LAT: 37.7749° N</span>
              <span>|</span>
              <span>LONG: 122.4194° W</span>
              <span>|</span>
              <span>ALT: ∞</span>
            </div>
          </motion.div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* 左侧：品牌标识 */}
          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              {/* 全息投影效果 */}
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-lg blur-xl"
                animate={{
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity
                }}
              />

              <div className="relative bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
                <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-3">
                  {t('title')}
                </h3>
                <p className="text-cyan-300/70 text-sm font-mono mb-4">
                  {t('subtitle')}
                </p>

                {/* 能量条装饰 */}
                <div className="space-y-2">
                  {['AUDIO', 'VISUAL', 'STELLAR'].map((label, i) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-[10px] text-cyan-400/50 font-mono w-12">{label}</span>
                      <div className="flex-1 h-1 bg-cyan-950/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${70 + i * 10}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 中间：音乐平台 */}
          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="border border-cyan-500/20 rounded-lg p-6 bg-black/30 backdrop-blur-sm">
              <h4 className="text-cyan-400 font-mono text-sm mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                {t('transmissions')}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {musicPlatforms.map((platform, i) => (
                  <motion.a
                    key={platform.name}
                    href={platform.url}
                    className={`group relative flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 transition-all duration-300 ${platform.color}`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="relative z-10">{platform.icon}</div>
                    <span className="text-xs font-mono text-gray-300 group-hover:text-white transition-colors">
                      {platform.name}
                    </span>

                    {/* Hover 光效 */}
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 右侧：社交媒体 & 导航 */}
          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="space-y-6">
              {/* 社交媒体 */}
              <div className="border border-cyan-500/20 rounded-lg p-6 bg-black/30 backdrop-blur-sm">
                <h4 className="text-cyan-400 font-mono text-sm mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                  {t('coordinates')}
                </h4>
                <div className="flex gap-3">
                  {socialLinks.map((social, i) => (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      className={`group relative w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 ${social.color}`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, type: 'spring' }}
                      aria-label={social.name}
                    >
                      {social.icon}

                      {/* Hover 粒子效果 */}
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        initial={{ opacity: 0 }}
                        whileHover={{
                          opacity: [0, 1, 0],
                          scale: [1, 1.5, 1.5]
                        }}
                        transition={{ duration: 0.6 }}
                        style={{
                          background: 'radial-gradient(circle, rgba(0,255,255,0.3) 0%, transparent 70%)'
                        }}
                      />
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* 导航链接 */}
              <div className="border border-cyan-500/20 rounded-lg p-6 bg-black/30 backdrop-blur-sm">
                <h4 className="text-cyan-400 font-mono text-sm mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                  {t('links')}
                </h4>
                <div className="space-y-2">
                  {[
                    { label: t('privacy'), href: '#' },
                    { label: t('terms'), href: '#' },
                    { label: t('contact'), href: '#' }
                  ].map((link, i) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      className="block text-sm text-gray-400 hover:text-cyan-400 transition-colors duration-300 font-mono"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      → {link.label}
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 底部版权信息 */}
        <motion.div
          className="pt-8 border-t border-cyan-500/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs font-mono text-center md:text-left">
              {t('copyright')}
            </p>
            <div className="flex items-center gap-3 text-xs font-mono text-gray-600">
              <motion.span
                animate={{
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                SIGNAL_STRENGTH: ████████░░ 80%
              </motion.span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 漂浮粒子效果 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            style={{
              left: `${(i * 37 + 11) % 100}%`,
              top: `${(i * 73 + 19) % 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3 + ((i * 13) % 20) / 10,
              repeat: Infinity,
              delay: (i * 17) % 30 / 10
            }}
          />
        ))}
      </div>
    </footer>
  );
}
