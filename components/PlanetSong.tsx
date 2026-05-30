'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Song } from '@/data/albumData';

interface PlanetSongProps {
  song: Song;
  index: number;
  onClick: () => void;
}

// 星球组件 - 代表每首歌曲
export default function PlanetSong({ song, index, onClick }: PlanetSongProps) {
  const [isHovered, setIsHovered] = useState(false);

  // 星球颜色（解锁 vs 锁定）
  const planetColor = song.unlocked
    ? song.color || '#FFD700'
    : '#444444';

  // 星球大小（缩小到原来的60%）
  const planetSize = song.unlocked ? 72 : 60;

  return (
    <motion.div
      className="relative flex flex-col items-center cursor-pointer overflow-visible"
      style={{
        pointerEvents: 'auto',
        touchAction: 'auto' // 允许所有触摸行为包括滚动
      }}
      onMouseEnter={() => {
        console.log('Hovering:', song.title);
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        console.log('Leave:', song.title);
        setIsHovered(false);
      }}
      onClick={onClick}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.15 }}
    >
      {/* 悬停发光效果 */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            width: planetSize + 40,
            height: planetSize + 40,
            background: `radial-gradient(circle, ${planetColor}40, transparent 70%)`,
            filter: 'blur(15px)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      {/* 星球本体 - 使用PNG图片 */}
      <motion.div
        className="relative rounded-full overflow-hidden"
        style={{
          width: planetSize,
          height: planetSize,
        }}
        animate={{
          y: [0, -10, 0],
          rotate: [0, 360],
        }}
        transition={{
          y: {
            duration: 3 + index * 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          },
          rotate: {
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }
        }}
      >
        {/* 星球图片 */}
        <img
          src={song.planetImage || "/images/planet1.png"}
          alt={song.title}
          className="w-full h-full object-cover"
        />

        {/* Block图标 - 右下角（仅锁定时显示）*/}
        {!song.unlocked && (
          <motion.div
            className="absolute bottom-1 right-1 w-6 h-6"
            animate={{
              y: [0, -5, 0],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <img
              src="/images/block.png"
              alt="Locked"
              className="w-full h-full object-contain"
            />
          </motion.div>
        )}
      </motion.div>


      {/* 歌曲信息 */}
      <motion.div
        className="mt-3 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0.7 }}
      >
        <h3 className="text-white font-bold text-base mb-1">
          {song.title}
        </h3>
        <p className="text-gray-400 text-xs">
          {song.unlocked ? '▶ Unlocked' : '🔒 Locked'}
        </p>
      </motion.div>

      {/* 歌曲简介卡片 - 固定在底部中央，保持水平 */}
      {isHovered && song.intro && (
        <motion.div
          className="fixed w-[90vw] sm:w-80 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl border-2 shadow-2xl mx-4"
          style={{
            bottom: '4rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            borderColor: song.color || '#fff',
            backdropFilter: 'blur(20px)',
            maxWidth: '400px'
          }}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {/* 装饰性光晕 */}
            <div
              className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-40 blur-2xl"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${song.color}, transparent 70%)`
              }}
            />

            <div className="relative z-10">
              {/* 歌曲标题 */}
              <h4 className="text-white font-bold text-lg sm:text-xl mb-2 sm:mb-3 flex items-center gap-2 justify-center">
                <span className="text-xl sm:text-2xl">🎵</span>
                {song.title}
              </h4>

              {/* 分隔线 */}
              <div
                className="h-0.5 w-full mb-3 sm:mb-4 rounded-full"
                style={{ background: `linear-gradient(to right, transparent, ${song.color}, transparent)` }}
              />

              {/* 简介文字 */}
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed italic text-center">
                "{song.intro}"
              </p>

              {/* 底部状态 */}
              <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-300">{song.duration}</span>
                <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${song.unlocked ? 'bg-green-500/30 text-green-200' : 'bg-gray-500/30 text-gray-300'}`}>
                  {song.unlocked ? '▶ Unlocked' : '🔒 Locked'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

      {/* 环绕粒子效果 */}
      {song.unlocked && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: planetColor,
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: [0, Math.cos(i * 120 * Math.PI / 180) * 50],
                y: [0, Math.sin(i * 120 * Math.PI / 180) * 50],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
