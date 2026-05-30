'use client';

import { useAudio } from '@/contexts/AudioContext';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalAudioPlayer() {
  const { currentSong, isPlaying, currentTime, duration, volume, togglePlay, seek, setVolume, playNext, playPrevious } = useAudio();
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // 格式化时间显示 (MM:SS)
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 处理进度条点击
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    seek(newTime);
  };

  // 处理音量变化
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // 切换静音
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      setVolume(0);
    } else {
      setVolume(1);
    }
  };

  // 如果没有当前歌曲，不显示播放器
  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-t border-white/10"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* 星星背景效果 */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
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

        <div className="max-w-7xl mx-auto px-4 py-3 relative z-10">
          <div className="flex items-center gap-4">
            {/* 歌曲信息 */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* 专辑封面 */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-xl">🎵</span>
              </div>

              {/* 歌曲标题 */}
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-semibold truncate">
                  {currentSong.title}
                </h3>
                <p className="text-gray-400 text-sm">DELIX</p>
              </div>
            </div>

            {/* 播放控制 */}
            <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
              {/* 播放按钮 */}
              <div className="flex items-center gap-4">
                {/* 上一首按钮 */}
                <button
                  onClick={playPrevious}
                  className="text-gray-400 hover:text-white transition-colors p-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>

                {/* 播放/暂停按钮 */}
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-white hover:bg-gray-200 flex items-center justify-center transition-all transform hover:scale-105 shadow-lg"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                {/* 下一首按钮 */}
                <button
                  onClick={playNext}
                  className="text-gray-400 hover:text-white transition-colors p-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 18h2V6h-2zm-11-1l8.5-6L5 5z"/>
                  </svg>
                </button>
              </div>

              {/* 进度条 */}
              <div className="flex items-center gap-3 w-full">
                <span className="text-xs text-gray-400 w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <div
                  ref={progressBarRef}
                  className="flex-1 h-1.5 bg-gray-700 rounded-full cursor-pointer group relative"
                  onClick={handleProgressClick}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative"
                    style={{ width: `${progress}%` }}
                  >
                    {/* 进度条圆点 */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </div>
                <span className="text-xs text-gray-400 w-10">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* 音量控制 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className="relative"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button
                  onClick={toggleMute}
                  className="text-gray-400 hover:text-white transition-colors p-2"
                >
                  {isMuted || volume === 0 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                    </svg>
                  )}
                </button>

                {/* 音量滑块 */}
                <AnimatePresence>
                  {showVolumeSlider && (
                    <motion.div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/60 backdrop-blur-md rounded-lg p-3 border border-white/10"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="h-20 w-1.5 appearance-none bg-gray-700 rounded-full cursor-pointer [writing-mode:vertical-lr] [direction:rtl]"
                        style={{
                          background: `linear-gradient(to top, #a855f7 0%, #a855f7 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
