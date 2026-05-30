'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSongBySlug } from '@/data/albumData';
import { useAudio } from '@/contexts/AudioContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnlock } from '@/contexts/UnlockContext';
import LyricsDisplay from '@/components/LyricsDisplay';

export default function SongPage() {
  const params = useParams();
  const router = useRouter();
  const { currentLanguage } = useLanguage();
  const { playSong, currentSong, isPlaying, currentTime } = useAudio();
  const { checkUnlock } = useUnlock();
  const [showMeteors, setShowMeteors] = useState(false);

  const slug = params.slug as string;
  const song = getSongBySlug(slug);

  // 如果歌曲不存在或未解锁，重定向回首页
  useEffect(() => {
    if (!song) {
      router.push('/');
      return;
    }

    const isUnlocked = checkUnlock(song.id);
    console.log('🎵 Song page loaded:', {
      songId: song.id,
      title: song.title,
      isUnlocked,
      albumDataUnlocked: song.unlocked
    });

    if (!isUnlocked) {
      console.log('🔒 Song not unlocked, redirecting to home');
      router.push('/');
    } else if (!currentSong || currentSong.id !== song.id) {
      // 自动播放歌曲
      console.log('▶️ Auto-playing song');
      playSong(song);
    }
  }, [song, router, currentSong, playSong, checkUnlock]);

  // 监听特定歌词时间，触发星星效果
  useEffect(() => {
    // "I should probably eat something" 的时间点：2:38.50 = 158.5秒
    const triggerTime = 158.5;
    const threshold = 0.5; // 0.5秒的误差范围

    if (currentTime >= triggerTime && currentTime <= triggerTime + threshold && !showMeteors) {
      setShowMeteors(true);
      // 星星出现后保持显示，不再隐藏
    }
  }, [currentTime, showMeteors]);

  if (!song) {
    return null;
  }

  const translations = {
    back: {
      en: 'Back to Album',
      zh: '返回专辑',
      ja: 'アルバムに戻る'
    },
    nowPlaying: {
      en: 'Now Playing',
      zh: '正在播放',
      ja: '再生中'
    }
  };

  const t = (key: keyof typeof translations) =>
    translations[key][currentLanguage as keyof typeof translations[typeof key]];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black relative overflow-hidden">
      {/* 宇宙背景 */}
      <div className="absolute inset-0">
        {/* 主色调背景 - 根据歌曲主题色 */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${song.color}40, transparent 70%)`
          }}
        />

        {/* 星星 */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10">
        {/* 顶部导航 */}
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
        >
          <div className="container mx-auto px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
            >
              <span className="text-2xl">←</span>
              <span>{t('back')}</span>
            </button>

            <div className="text-center">
              <p className="text-gray-400 text-sm">{t('nowPlaying')}</p>
              <h2 className="text-white text-xl font-bold">{song.title}</h2>
            </div>

            <div className="w-24"></div> {/* 占位符保持居中 */}
          </div>
        </motion.div>

        {/* 歌曲内容区域 */}
        <div className="container mx-auto px-8 pt-32 pb-40 min-h-screen flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 w-full">

            {/* 左侧：歌词区域 */}
            <motion.div
              className="flex flex-col justify-center"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
                <div className="p-8 border-b border-white/10">
                  <h1 className="text-5xl font-black text-white">
                    {song.title}
                  </h1>
                  {song.description && (
                    <p className="text-gray-400 mt-4">
                      {song.description[currentLanguage as keyof typeof song.description]}
                    </p>
                  )}
                </div>

                {/* 歌词同步显示 */}
                <LyricsDisplay className="h-[500px]" />
              </div>
            </motion.div>

            {/* 右侧：视频（The Real Reason）或 star.png 动画 */}
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              {song.slug === 'the-real-reason' ? (
                /* The Real Reason 专属：全屏视频 */
                <div className="relative w-full min-h-[700px] h-full">
                  <video
                    src="/video/therealreason.mp4"
                    className="w-full h-full min-h-[700px] object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                </div>
              ) : song.slug === 'third-person' ? (
                /* Third Person 专属：全屏视频 */
                <div className="relative w-full min-h-[700px] h-full">
                  <video
                    src="/video/car.MP4"
                    className="w-full h-full min-h-[700px] object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                </div>
              ) : song.slug === 'salmon-and-potatoes' ? (
                /* Salmon and Potatoes 专属：全屏视频 */
                <div className="relative w-full min-h-[700px] h-full">
                  <video
                    src="/video/book.MP4"
                    className="w-full h-full min-h-[700px] object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                </div>
              ) : (
                /* 其他歌曲：star.png 动画 */
                <div className="relative w-full aspect-square max-w-lg flex items-center justify-center overflow-visible">
                  {/* 发光背景效果 */}
                  <motion.div
                    className="absolute w-96 h-96 rounded-full blur-3xl"
                    style={{
                      background: `radial-gradient(circle, ${song.color}40, transparent 70%)`,
                    }}
                    animate={{
                      scale: isPlaying ? [1, 1.3, 1] : 1,
                      opacity: isPlaying ? [0.3, 0.6, 0.3] : 0.3,
                    }}
                    transition={{
                      duration: 3,
                      repeat: isPlaying ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  />

                  <motion.img
                    src="/images/star.png"
                    alt="Star"
                    className="relative z-10 w-64 h-64 object-contain"
                    style={{
                      filter: `drop-shadow(0 0 30px ${song.color}) drop-shadow(0 0 60px ${song.color}80)`,
                    }}
                    animate={{
                      rotate: isPlaying ? 360 : 0,
                      scale: isPlaying ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                      rotate: {
                        duration: 8,
                        repeat: isPlaying ? Infinity : 0,
                        ease: "linear",
                      },
                      scale: {
                        duration: 2,
                        repeat: isPlaying ? Infinity : 0,
                        ease: "easeInOut",
                      }
                    }}
                  />

                  {/* 环绕星星效果 - 两圈（仅其他歌曲显示）*/}
                  <AnimatePresence>
                    {showMeteors && (
                      <>
                      {/* 第一圈：8颗星星，半径150px */}
                      {[...Array(8)].map((_, i) => {
                        const angle = (i * 360) / 8;
                        const radius = 150;
                        return (
                          <motion.div
                            key={`orbit1-${i}`}
                            className="absolute pointer-events-none"
                            style={{
                              left: '50%',
                              top: '50%',
                            }}
                            initial={{
                              x: -16,
                              y: -16,
                              rotate: angle,
                              opacity: 0,
                              scale: 0,
                            }}
                            animate={{
                              rotate: [angle, angle + 360],
                              opacity: 1,
                              scale: 1,
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0,
                            }}
                            transition={{
                              rotate: {
                                duration: 4,
                                repeat: Infinity,
                                ease: "linear",
                              },
                              opacity: {
                                duration: 0.5,
                                delay: i * 0.1,
                              },
                              scale: {
                                duration: 0.5,
                                delay: i * 0.1,
                              }
                            }}
                          >
                            <img
                              src="/images/star.png"
                              alt="Star"
                              className="w-8 h-8 object-contain"
                              style={{
                                filter: `drop-shadow(0 0 6px ${song.color}) drop-shadow(0 0 12px ${song.color})`,
                                transform: `translateX(${radius}px)`,
                              }}
                            />
                          </motion.div>
                        );
                      })}

                      {/* 第二圈：7颗星星，半径220px，反向旋转 */}
                      {[...Array(7)].map((_, i) => {
                        const angle = (i * 360) / 7;
                        const radius = 220;
                        return (
                          <motion.div
                            key={`orbit2-${i}`}
                            className="absolute pointer-events-none"
                            style={{
                              left: '50%',
                              top: '50%',
                            }}
                            initial={{
                              x: -20,
                              y: -20,
                              rotate: angle,
                              opacity: 0,
                              scale: 0,
                            }}
                            animate={{
                              rotate: [angle, angle - 360],
                              opacity: 1,
                              scale: 1,
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0,
                            }}
                            transition={{
                              rotate: {
                                duration: 6,
                                repeat: Infinity,
                                ease: "linear",
                              },
                              opacity: {
                                duration: 0.5,
                                delay: 0.5 + i * 0.1,
                              },
                              scale: {
                                duration: 0.5,
                                delay: 0.5 + i * 0.1,
                              }
                            }}
                          >
                            <img
                              src="/images/star.png"
                              alt="Star"
                              className="w-10 h-10 object-contain"
                              style={{
                                filter: `drop-shadow(0 0 8px ${song.color}) drop-shadow(0 0 16px ${song.color})`,
                                transform: `translateX(${radius}px)`,
                              }}
                            />
                          </motion.div>
                        );
                      })}
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
