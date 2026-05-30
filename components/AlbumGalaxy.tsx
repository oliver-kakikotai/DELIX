'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { albumData } from '@/data/albumData';
import PlanetSong from './PlanetSong';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnlock } from '@/contexts/UnlockContext';
import Model3DViewer from './Model3DViewer';

// 生成固定的星星位置（使用种子，避免hydration错误）
const generateStarPositions = () => {
  return Array.from({ length: 50 }, (_, i) => ({
    left: (i * 37 + 17) % 100,
    top: (i * 73 + 29) % 100,
    duration: 2 + ((i * 23) % 30) / 10,
    delay: ((i * 41) % 50) / 10,
  }));
};

const starPositions = generateStarPositions();

export default function AlbumGalaxy() {
  const router = useRouter();
  const { currentLanguage } = useLanguage();
  const { checkUnlock } = useUnlock();
  const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null);
  const [showPlanets, setShowPlanets] = useState(false);
  const [orbitRadii, setOrbitRadii] = useState([260, 330, 400, 470, 540]);

  // 计算响应式轨道半径
  // 模型大小：360px，半径180px
  // 轨道从模型边缘外开始，留出间距
  useEffect(() => {
    const calculateRadii = () => {
      const vmin = Math.min(window.innerWidth, window.innerHeight);
      const modelRadius = 180; // 360px / 2
      const gap = 80; // 模型边缘与第一条轨道的间距

      if (vmin < 768) {
        // 移动端：基于视口单位
        const modelRadiusVmin = 17.5; // 35vmin / 2 (模型在移动端也应该响应式)
        const gapVmin = 8; // 间距
        return [
          vmin * (modelRadiusVmin + gapVmin + 5) / 100,   // 第1轨道：模型半径 + 间距 + 5vmin
          vmin * (modelRadiusVmin + gapVmin + 12) / 100,  // 第2轨道
          vmin * (modelRadiusVmin + gapVmin + 19) / 100,  // 第3轨道
          vmin * (modelRadiusVmin + gapVmin + 26) / 100,  // 第4轨道
          vmin * (modelRadiusVmin + gapVmin + 33) / 100   // 第5轨道
        ];
      } else {
        // 桌面端：第1轨道从模型边缘外80px开始，每条轨道间距70px
        return [
          modelRadius + gap,        // 260px - 第1轨道
          modelRadius + gap + 70,   // 330px - 第2轨道
          modelRadius + gap + 140,  // 400px - 第3轨道
          modelRadius + gap + 210,  // 470px - 第4轨道
          modelRadius + gap + 280   // 540px - 第5轨道
        ];
      }
    };

    setOrbitRadii(calculateRadii());

    const handleResize = () => {
      setOrbitRadii(calculateRadii());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 启动加载动画序列
  useEffect(() => {
    // 延迟让星球从3D模型背后飞出
    const planetsTimer = setTimeout(() => setShowPlanets(true), 800);

    return () => {
      clearTimeout(planetsTimer);
    };
  }, []);

  const handlePlanetClick = (songId: number) => {
    const song = albumData.songs.find(s => s.id === songId);
    if (!song) return;

    const unlocked = checkUnlock(songId);

    console.log('🔍 Planet clicked:', {
      songId,
      title: song.title,
      unlocked,
      albumDataUnlocked: song.unlocked
    });

    if (unlocked) {
      // 已解锁 - 跳转到歌曲页面
      console.log('✅ Unlocked - navigating to:', `/song/${song.slug}`);
      router.push(`/song/${song.slug}`);
    } else {
      // 未解锁 - 显示解锁提示
      console.log('🔒 Locked - showing popup');
      setSelectedPlanet(songId);
    }
  };

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
    progress: {
      en: 'Progress',
      zh: '进度',
      ja: '進捗'
    },
    unlocked: {
      en: 'Unlocked',
      zh: '已解锁',
      ja: '解放済み'
    },
    unlockHint: {
      en: 'Complete the previous song to unlock',
      zh: '完成上一首歌曲以解锁',
      ja: '前の曲を完了して解除'
    },
    close: {
      en: 'Close',
      zh: '关闭',
      ja: '閉じる'
    }
  };

  const t = (key: keyof typeof translations) =>
    translations[key][currentLanguage as keyof typeof translations[typeof key]];

  return (
    <>
    <div className="min-h-screen relative" style={{ touchAction: 'auto', overscrollBehavior: 'auto' }}>

      {/* 宇宙背景 - 星云和星系 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* 主星系背景 */}
        <div className="absolute inset-0 bg-gradient-radial from-purple-950/20 via-blue-950/30 to-black"></div>

        {/* 螺旋星系 */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-conic from-purple-500/15 via-transparent to-purple-500/15"></div>
        </motion.div>

        {/* 星云效果 */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-radial from-purple-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-radial from-blue-500/15 via-cyan-500/8 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* 星星 - 使用固定位置避免hydration错误 */}
        <div className="absolute inset-0">
          {starPositions.map((star, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                delay: star.delay
              }}
            />
          ))}
        </div>
      </div>

      {/* 3D模型和星球系统 - 绝对定位在页面中央，响应式尺寸 */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] max-w-[1400px] max-h-[1400px]"
        style={{
          zIndex: 1,
          pointerEvents: 'none', // 容器不阻挡触摸事件
          touchAction: 'auto'
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center overflow-visible">
          {/* 中央3D模型 - 太阳系的"太阳"（星球的5倍大小：72px × 5 = 360px） */}
          <div
            className="absolute w-[360px] h-[360px]"
            style={{
              zIndex: 10,  // 中间层级：星球在前面时z-index>10，在后面时z-index<10
              pointerEvents: 'none', // 移动端完全不响应
              touchAction: 'auto'
            }}
          >
            <Model3DViewer
              modelPath="/models/hitem3d.glb"
              className="w-full h-full"
              autoRotate={true}
              autoRotateSpeed={1.5}
            />
          </div>

          {/* 星球轨道系统 - 太阳系效果，中心点与3D模型对齐 */}
          <div
            className="absolute overflow-visible"
            style={{
              width: 0,
              height: 0,
              zIndex: 5,
              pointerEvents: 'none' // 容器不阻挡事件
            }}
          >
          {albumData.songs.map((song, index) => {
            const unlocked = checkUnlock(song.id);

            // 太阳系风格的轨道系统 - 使用响应式轨道半径
            const orbits = [
              {
                radius: orbitRadii[0],  // 轨道1（最内层）
                duration: 20,
                initialRotation: 315, // 右下方（4-5点方向）
                zIndex: 1,
                name: 'Inner Orbit'
              },
              {
                radius: orbitRadii[1],  // 轨道2
                duration: 35,
                initialRotation: 135,  // 左上方（10-11点方向）
                zIndex: 2,
                name: 'Second Orbit'
              },
              {
                radius: orbitRadii[2],  // 轨道3
                duration: 50,
                initialRotation: 225, // 左下方（7-8点方向）
                zIndex: 3,
                name: 'Third Orbit'
              },
              {
                radius: orbitRadii[3],  // 轨道4
                duration: 65,
                initialRotation: 45,   // 右上方（1-2点方向）
                zIndex: 4,
                name: 'Fourth Orbit'
              },
              {
                radius: orbitRadii[4],  // 轨道5（最外层）
                duration: 80,
                initialRotation: 180,  // 正下方（6点方向）
                zIndex: 5,
                name: 'Outer Orbit'
              }
            ];

            // 星球到轨道的映射关系
            // index 0 (Tomorrow) → 轨道3 (660px)
            // index 1 (The Real Reason) → 轨道1 (500px)
            // index 2 (Third Person) → 轨道2 (580px)
            // index 3 (Salmon) → 轨道0 (420px 最内，离模型更远)
            // index 4 (The Ascension) → 轨道4 (740px 最外)
            const orbitMapping = [3, 1, 2, 0, 4];
            const orbit = orbits[orbitMapping[index]];

            // The Ascension (index 4) 使用特殊的左右滑动动画 - 渲染在外层
            if (index === 4) {
              // 跳过在这里渲染，稍后在外层渲染
              return null;
            }

            // 太阳系效果：根据轨道位置动态设置z-index
            // 模型(太阳)的z-index是10
            // 星球在轨道前半圈(0-180度)时，z-index=15（在太阳前面）
            // 星球在轨道后半圈(180-360度)时，z-index=5（在太阳后面）

            // 其他星球使用轨道动画
            return (
              <motion.div
                key={song.id}
                className="absolute overflow-visible"
                style={{
                  top: 0,
                  left: 0,
                  width: 0,
                  height: 0,
                }}
                initial={{
                  rotate: orbit.initialRotation,
                  scale: 0,
                  opacity: 0,
                  zIndex: 5
                }}
                animate={showPlanets ? {
                  rotate: [orbit.initialRotation, orbit.initialRotation + 360],
                  scale: 1,
                  opacity: 1,
                  // z-index动画：前半圈15（前面），后半圈5（后面）
                  zIndex: [15, 15, 5, 5, 15]
                } : {
                  rotate: orbit.initialRotation,
                  scale: 0,
                  opacity: 0,
                  zIndex: 5
                }}
                transition={{
                  scale: { duration: 1.2, ease: "easeOut", delay: index * 0.2 },
                  opacity: { duration: 0.8, delay: index * 0.2 },
                  rotate: {
                    duration: orbit.duration,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop",
                    delay: 1.5 + index * 0.2
                  },
                  zIndex: {
                    duration: orbit.duration,
                    times: [0, 0.25, 0.5, 0.75, 1],  // 在25%和75%处切换z-index
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop",
                    delay: 1.5 + index * 0.2
                  }
                }}
              >
                {/* 轨道线 - 太阳系风格 */}
                <motion.div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: orbit.radius * 2,
                    height: orbit.radius * 2,
                    left: -orbit.radius,
                    top: -orbit.radius,
                    border: '1px solid rgba(139, 92, 246, 0.15)',
                    boxShadow: `
                      inset 0 0 30px rgba(139, 92, 246, 0.05),
                      0 0 15px rgba(139, 92, 246, 0.1)
                    `
                  }}
                  initial={{ opacity: 0 }}
                  animate={showPlanets ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                />

                {/* 星球容器 - 反向旋转保持星球直立，从中心飞出到轨道 */}
                <motion.div
                  className="absolute overflow-visible"
                  style={{
                    left: 0,
                    transform: 'translate(-50%, -50%)',
                  }}
                  initial={{
                    top: 0,
                    rotate: -orbit.initialRotation,
                  }}
                  animate={showPlanets ? {
                    top: -orbit.radius,
                    rotate: [-orbit.initialRotation, -orbit.initialRotation - 360]
                  } : {
                    top: 0,
                    rotate: -orbit.initialRotation,
                  }}
                  transition={{
                    top: { duration: 1.2, ease: "easeOut", delay: index * 0.2 },
                    rotate: {
                      duration: orbit.duration,
                      repeat: Infinity,
                      ease: "linear",
                      repeatType: "loop",
                      delay: 1.5 + index * 0.2
                    }
                  }}
                >
                  <PlanetSong
                    song={{ ...song, unlocked }}
                    index={index}
                    onClick={() => handlePlanetClick(song.id)}
                  />
                </motion.div>
              </motion.div>
            );
          })}
          </div>
        </div>
      </div>


      {/* 解锁提示弹窗 */}
      {selectedPlanet && (() => {
        const song = albumData.songs.find(s => s.id === selectedPlanet);

        // 工具信息映射
        const toolInfo: Record<number, { name: string; icon: string; logId: number }> = {
          1: { name: 'COSMIC AMPLIFIER', icon: '🔮', logId: 5 },
          2: { name: 'STELLAR NAVIGATOR', icon: '🧭', logId: 1 },
          4: { name: 'TEMPORAL DECODER', icon: '⏰', logId: 3 },
          5: { name: 'ASCENSION CORE', icon: '💎', logId: 4 }
        };

        const tool = toolInfo[selectedPlanet];

        return (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedPlanet(null)}
          >
            <motion.div
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-3 sm:p-4 md:p-6 max-w-lg w-full mx-4 border-2 border-purple-500/50 shadow-2xl"
              style={{
                boxShadow: '0 0 40px rgba(168, 85, 247, 0.4)',
                maxHeight: '85vh',
                overflowY: 'auto'
              }}
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-2.5 sm:space-y-3">
                {/* 锁定图标 */}
                <motion.div
                  className="text-4xl sm:text-5xl md:text-6xl"
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  🔒
                </motion.div>

                {/* 歌曲标题 */}
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1">
                    {song?.title}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    This planet is locked
                  </p>
                </div>

                {/* 分隔线 */}
                <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

                {/* 工具需求 */}
                {tool && (
                  <div className="bg-black/30 rounded-xl p-3 sm:p-4 border border-purple-500/30">
                    <p className="text-cyan-400 font-mono text-xs sm:text-sm mb-2 sm:mb-3">
                      🔧 REQUIRED TOOL
                    </p>

                    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <motion.div
                        className="text-2xl sm:text-3xl md:text-4xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, -10, 10, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      >
                        {tool.icon}
                      </motion.div>
                      <div className="text-left">
                        <h4 className="text-base sm:text-lg font-bold text-purple-400">
                          {tool.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-400">
                          Found in Log Entry #{tool.logId}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-300 text-xs sm:text-sm">
                      {song?.unlockCondition?.description[currentLanguage as keyof typeof song.unlockCondition.description]}
                    </p>
                  </div>
                )}

                {/* 导航提示 */}
                <motion.div
                  className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 sm:p-3"
                  animate={{
                    borderColor: ['rgba(168, 85, 247, 0.3)', 'rgba(168, 85, 247, 0.6)', 'rgba(168, 85, 247, 0.3)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <p className="text-purple-300 text-xs sm:text-sm">
                    💡 Scroll down to <span className="font-bold">SHIP LOG ARCHIVE</span> to collect this tool
                  </p>
                </motion.div>

                {/* 关闭按钮 */}
                <div className="pt-1">
                  <button
                    onClick={() => setSelectedPlanet(null)}
                    className="w-full px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-sm sm:text-base font-bold transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
                  >
                    {t('close')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })()}

    </div>

      {/* The Ascension - 独立的左右滑动层，完全在外层容器之外 */}
      {(() => {
        const ascensionSong = albumData.songs.find(s => s.id === 5);
        if (!ascensionSong) return null;
        const unlocked = checkUnlock(5);

        return (
          <motion.div
            className="fixed"
            style={{
              top: '50%',
              left: '-200px',  // 初始位置在左侧屏幕外
              transform: 'translateY(-50%)',
              zIndex: 100,
              width: '200px',  // 给星球容器固定宽度
              pointerEvents: 'auto'
            }}
            initial={{
              x: 0,
              opacity: 0
            }}
            animate={showPlanets ? {
              x: [
                0,                      // 起点：-200px（left值）
                'calc(100vw + 400px)',  // 终点：滑到右侧屏幕外
                0                       // 回到：-200px
              ],
              opacity: 1
            } : {
              x: 0,
              opacity: 0
            }}
            transition={{
              opacity: { duration: 0.5, delay: 2 },
              x: {
                duration: 80,  // 和最外层轨道速度一致：80秒完成来回
                repeat: Infinity,
                ease: "linear",
                repeatType: "loop",
                delay: 2.5,
                times: [0, 0.5, 1]  // 40秒左→右，40秒右→左
              }
            }}
          >
            <PlanetSong
              song={{ ...ascensionSong, unlocked }}
              index={4}
              onClick={() => handlePlanetClick(5)}
            />
          </motion.div>
        );
      })()}
    </>
  );
}
