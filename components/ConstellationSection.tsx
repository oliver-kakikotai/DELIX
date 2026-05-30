'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUnlock } from '@/contexts/UnlockContext';

interface Tool {
  id: number;
  name: string;
  description: string;
  image: string;
  unlocksSong: string;
}

interface LogEntry {
  id: number;
  stardate: string;
  coordinates: string;
  title: string;
  content: string;
  status: 'completed' | 'in-progress' | 'critical';
  energyLevel: number;
  icon: string;
  tool: Tool;
}

// 太空航海日志数据
const logEntries: LogEntry[] = [
  {
    id: 1,
    stardate: '2020.03.14',
    coordinates: 'Sector Alpha-7',
    title: 'MISSION INITIATED',
    content: 'First contact with the sonic frequencies of deep space. Instruments calibrated. The journey into musical cosmos has begun. All systems nominal.',
    status: 'completed',
    energyLevel: 100,
    icon: '🚀',
    tool: {
      id: 1,
      name: 'STELLAR NAVIGATOR',
      description: 'An advanced navigation system that charts courses through emotional nebulae. Essential for exploring deeper territories of sound.',
      image: '/images/NS.png',
      unlocksSong: 'The Real Reason'
    }
  },
  {
    id: 2,
    stardate: '2021.07.22',
    coordinates: 'Nebula Station X-12',
    title: 'SOUND SYNTHESIS BREAKTHROUGH',
    content: 'Discovered unique harmonic resonance in the bedroom lab. Synthesizers responding to cosmic signals. Creating melodies that transcend dimensions.',
    status: 'completed',
    energyLevel: 85,
    icon: '🎹',
    tool: {
      id: 2,
      name: 'QUANTUM SYNTHESIZER',
      description: 'A reality-bending device that transforms thoughts into sonic waves. Allows access to third-person perspective frequencies.',
      image: '⚛️',
      unlocksSong: 'Third Person'
    }
  },
  {
    id: 3,
    stardate: '2022.11.08',
    coordinates: 'Void Sector Theta',
    title: 'CREATIVE ANOMALY DETECTED',
    content: 'Developed signature sound signature. Blending introspective frequencies with experimental beats. Musical identity protocols establishing.',
    status: 'completed',
    energyLevel: 92,
    icon: '🎵',
    tool: {
      id: 3,
      name: 'TEMPORAL DECODER',
      description: 'Decrypts memories encoded in time streams. Reveals simple joys hidden in complex moments like salmon and potatoes.',
      image: '/images/stone.png',
      unlocksSong: 'Salmon and Potatoes'
    }
  },
  {
    id: 4,
    stardate: '2023.04.17',
    coordinates: 'Project DELIX Genesis',
    title: 'ALBUM CONCEPT INITIALIZATION',
    content: 'Commencing full-scale production. Each track represents a dimension of human consciousness. Space journey architecture finalized.',
    status: 'in-progress',
    energyLevel: 78,
    icon: '🌌',
    tool: {
      id: 4,
      name: 'ASCENSION CORE',
      description: 'The ultimate power source. Fuels the final leap beyond limitations. Required to reach the highest dimensional frequencies.',
      image: '/images/diamond.png',
      unlocksSong: 'The Ascension'
    }
  },
  {
    id: 5,
    stardate: '2024.12.25',
    coordinates: 'Release Coordinates Confirmed',
    title: 'DELIX PROTOCOL ACTIVATED',
    content: 'Album transmission complete. Five sonic dimensions now accessible to all consciousness. The ascension sequence is live. Mission accomplished.',
    status: 'critical',
    energyLevel: 100,
    icon: '✨',
    tool: {
      id: 5,
      name: 'COSMIC AMPLIFIER',
      description: 'A legendary artifact that amplifies creative resonance across all dimensions. Complete collection unlocks special features.',
      image: '/images/egg.png',
      unlocksSong: 'Special Unlock'
    }
  }
];

export default function ConstellationSection() {
  const { collectTool, checkToolCollected } = useUnlock();
  const [selectedLog, setSelectedLog] = useState<number | null>(null);
  const [hoveredLog, setHoveredLog] = useState<number | null>(null);
  const [collectingTool, setCollectingTool] = useState<number | null>(null);
  const [showCollectEffect, setShowCollectEffect] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#00ff88';
      case 'in-progress': return '#00d4ff';
      case 'critical': return '#ff0088';
      default: return '#00d4ff';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'COMPLETED';
      case 'in-progress': return 'IN PROGRESS';
      case 'critical': return 'CRITICAL';
      default: return 'UNKNOWN';
    }
  };

  // 处理工具收集
  const handleCollectTool = (toolId: number) => {
    setCollectingTool(toolId);
    setShowCollectEffect(true);

    // 延迟收集，让动画先播放
    setTimeout(() => {
      collectTool(toolId);
      setCollectingTool(null);

      // 关闭粒子效果
      setTimeout(() => {
        setShowCollectEffect(false);
      }, 1000);
    }, 800);
  };

  return (
    <section className="relative w-full min-h-screen bg-black py-20 px-4 overflow-hidden">
      {/* 背景网格 */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, #00d4ff 1px, transparent 1px),
              linear-gradient(to bottom, #00d4ff 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* 扫描线动画 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0, 212, 255, 0.1) 50%, transparent 100%)',
          height: '100px'
        }}
        animate={{
          y: ['-100px', '100vh']
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      {/* 标题 HUD */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto mb-16"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* 顶部装饰线 */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500 to-cyan-500" />
          <motion.div
            className="px-4 py-1 border border-cyan-500 rounded text-cyan-400 text-xs font-mono"
            animate={{
              boxShadow: ['0 0 10px rgba(0, 212, 255, 0.5)', '0 0 20px rgba(0, 212, 255, 0.8)', '0 0 10px rgba(0, 212, 255, 0.5)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            SECURE TRANSMISSION
          </motion.div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-cyan-500 to-cyan-500" />
        </div>

        {/* 主标题 */}
        <div className="text-center space-y-4">
          <motion.h2
            className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 tracking-wider"
            animate={{
              textShadow: [
                '0 0 20px rgba(0, 212, 255, 0.5)',
                '0 0 40px rgba(0, 212, 255, 0.8)',
                '0 0 20px rgba(0, 212, 255, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            SHIP LOG ARCHIVE
          </motion.h2>
          <div className="flex items-center justify-center gap-6 text-cyan-400 font-mono text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>VESSEL: RUNAWAY RABBIT</span>
            </div>
            <div className="w-px h-4 bg-cyan-400/50" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>MISSION: DELIX</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 日志条目列表 */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        {logEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            className="relative group cursor-pointer"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            onMouseEnter={() => setHoveredLog(entry.id)}
            onMouseLeave={() => setHoveredLog(null)}
            onClick={() => setSelectedLog(entry.id)}
          >
            {/* 全息面板背景 */}
            <div className="relative">
              {/* 主面板 */}
              <div
                className="relative border-2 rounded-lg p-6 backdrop-blur-sm transition-all duration-300"
                style={{
                  background: hoveredLog === entry.id
                    ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(136, 0, 255, 0.1))'
                    : 'rgba(0, 0, 0, 0.5)',
                  borderColor: getStatusColor(entry.status),
                  boxShadow: hoveredLog === entry.id
                    ? `0 0 30px ${getStatusColor(entry.status)}80`
                    : `0 0 10px ${getStatusColor(entry.status)}40`
                }}
              >
                {/* 扫描线效果 */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-30"
                  style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 212, 255, 0.03) 2px, rgba(0, 212, 255, 0.03) 4px)'
                  }}
                />

                {/* 内容区域 */}
                <div className="relative z-10 grid grid-cols-12 gap-4">
                  {/* 左侧：图标和状态 */}
                  <div className="col-span-2 flex flex-col items-center justify-center space-y-3">
                    <motion.div
                      className="text-5xl"
                      animate={{
                        scale: hoveredLog === entry.id ? 1.2 : 1,
                        rotate: hoveredLog === entry.id ? 360 : 0
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {entry.icon}
                    </motion.div>

                    {/* 状态指示器 */}
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-full animate-pulse"
                        style={{ backgroundColor: getStatusColor(entry.status) }}
                      />
                      <span
                        className="text-[10px] font-mono font-bold"
                        style={{ color: getStatusColor(entry.status) }}
                      >
                        {getStatusText(entry.status)}
                      </span>
                    </div>
                  </div>

                  {/* 中间：日志信息 */}
                  <div className="col-span-7 space-y-2">
                    {/* 星历和坐标 */}
                    <div className="flex items-center gap-4 text-xs font-mono text-cyan-400">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-500">⏱</span>
                        <span>STARDATE: {entry.stardate}</span>
                      </div>
                      <div className="w-px h-3 bg-cyan-500/50" />
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-500">📍</span>
                        <span>{entry.coordinates}</span>
                      </div>
                    </div>

                    {/* 标题 */}
                    <h3
                      className="text-2xl font-black tracking-wide"
                      style={{ color: getStatusColor(entry.status) }}
                    >
                      {entry.title}
                    </h3>

                    {/* 内容预览 */}
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {entry.content.substring(0, 100)}...
                    </p>
                  </div>

                  {/* 右侧：能量条和访问按钮 */}
                  <div className="col-span-3 flex flex-col justify-between items-end">
                    {/* 能量条 */}
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-xs font-mono text-cyan-400">
                        <span>ENERGY</span>
                        <span>{entry.energyLevel}%</span>
                      </div>
                      <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-cyan-500/30">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(to right, ${getStatusColor(entry.status)}, rgba(0, 212, 255, 0.8))`,
                            boxShadow: `0 0 10px ${getStatusColor(entry.status)}`
                          }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${entry.energyLevel}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>

                    {/* 访问按钮 */}
                    <motion.button
                      className="px-4 py-2 border rounded font-mono text-xs font-bold transition-all duration-300"
                      style={{
                        borderColor: getStatusColor(entry.status),
                        color: getStatusColor(entry.status),
                        background: hoveredLog === entry.id
                          ? `${getStatusColor(entry.status)}20`
                          : 'transparent'
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ACCESS LOG →
                    </motion.button>
                  </div>
                </div>

                {/* 边角装饰 */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: getStatusColor(entry.status) }} />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: getStatusColor(entry.status) }} />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: getStatusColor(entry.status) }} />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: getStatusColor(entry.status) }} />
              </div>

              {/* 发光效果 */}
              {hoveredLog === entry.id && (
                <motion.div
                  className="absolute inset-0 -z-10 rounded-lg blur-xl"
                  style={{
                    background: `radial-gradient(circle at center, ${getStatusColor(entry.status)}40, transparent 70%)`
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 详细日志弹窗 */}
      <AnimatePresence>
        {selectedLog !== null && (() => {
          const entry = logEntries.find(e => e.id === selectedLog)!;
          return (
            <motion.div
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
            >
              <motion.div
                className="relative max-w-3xl w-full border-2 rounded-xl p-4 sm:p-6 md:p-8 backdrop-blur-sm mx-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(136, 0, 255, 0.05))',
                  borderColor: getStatusColor(entry.status),
                  boxShadow: `0 0 50px ${getStatusColor(entry.status)}60`,
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* 扫描线 */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-20 rounded-xl"
                  style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 212, 255, 0.1) 2px, rgba(0, 212, 255, 0.1) 4px)'
                  }}
                />

                {/* 内容 */}
                <div className="relative z-10 space-y-3 sm:space-y-4">
                  {/* 头部 */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl sm:text-5xl">{entry.icon}</span>
                        <div>
                          <h3
                            className="text-xl sm:text-2xl md:text-3xl font-black tracking-wide"
                            style={{ color: getStatusColor(entry.status) }}
                          >
                            {entry.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-[10px] sm:text-xs font-mono text-cyan-400">
                            <span>STARDATE: {entry.stardate}</span>
                            <div className="w-px h-3 bg-cyan-500/50" />
                            <span>{entry.coordinates}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 状态徽章 */}
                    <div
                      className="px-3 py-1.5 border rounded-full font-mono text-[10px] sm:text-xs font-bold whitespace-nowrap"
                      style={{
                        borderColor: getStatusColor(entry.status),
                        color: getStatusColor(entry.status),
                        background: `${getStatusColor(entry.status)}20`
                      }}
                    >
                      {getStatusText(entry.status)}
                    </div>
                  </div>

                  {/* 分隔线 */}
                  <div
                    className="h-px"
                    style={{
                      background: `linear-gradient(to right, transparent, ${getStatusColor(entry.status)}, transparent)`
                    }}
                  />

                  {/* 正文 */}
                  <div className="space-y-2">
                    <div className="text-gray-300 leading-relaxed text-sm sm:text-base">
                      {entry.content}
                    </div>
                  </div>

                  {/* 工具发现区域 */}
                  <motion.div
                    className="relative border-2 rounded-xl p-3 sm:p-4 md:p-6 backdrop-blur-md"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(136, 0, 255, 0.08))',
                      borderColor: getStatusColor(entry.status),
                      boxShadow: `0 0 30px ${getStatusColor(entry.status)}40`
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {/* 标题 */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: getStatusColor(entry.status) }} />
                      <h4 className="text-xs sm:text-sm font-mono font-bold text-cyan-400 tracking-wider">
                        🔧 TOOL DISCOVERED
                      </h4>
                      <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
                    </div>

                    {/* 工具展示 */}
                    <div className="grid grid-cols-12 gap-3 sm:gap-4">
                      {/* 左侧：工具图标 */}
                      <div className="col-span-12 sm:col-span-3 flex items-center justify-center">
                        <motion.div
                          className="relative"
                          animate={{
                            rotate: checkToolCollected(entry.tool.id) ? 0 : [0, -10, 10, -10, 10, 0],
                            scale: collectingTool === entry.tool.id ? [1, 1.3, 0.8, 1.2, 1] : 1
                          }}
                          transition={{
                            rotate: { duration: 2, repeat: Infinity, repeatDelay: 1 },
                            scale: { duration: 0.8 }
                          }}
                        >
                          {/* 发光效果 */}
                          {!checkToolCollected(entry.tool.id) && (
                            <motion.div
                              className="absolute inset-0 rounded-full blur-2xl"
                              style={{
                                background: `radial-gradient(circle, ${getStatusColor(entry.status)}80, transparent 70%)`,
                                transform: 'scale(2)'
                              }}
                              animate={{
                                opacity: [0.3, 0.7, 0.3]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity
                              }}
                            />
                          )}

                          <div className="relative text-5xl sm:text-6xl md:text-8xl flex items-center justify-center">
                            {entry.tool.image.startsWith('/') ? (
                              <img
                                src={entry.tool.image}
                                alt={entry.tool.name}
                                className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-contain"
                              />
                            ) : (
                              entry.tool.image
                            )}
                          </div>

                          {/* 粒子爆炸效果 */}
                          {showCollectEffect && collectingTool === entry.tool.id && (
                            <>
                              {[...Array(12)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: getStatusColor(entry.status),
                                    left: '50%',
                                    top: '50%'
                                  }}
                                  initial={{ scale: 1, opacity: 1 }}
                                  animate={{
                                    x: Math.cos((i * 30) * Math.PI / 180) * 100,
                                    y: Math.sin((i * 30) * Math.PI / 180) * 100,
                                    opacity: 0,
                                    scale: 0
                                  }}
                                  transition={{ duration: 1, ease: 'easeOut' }}
                                />
                              ))}
                            </>
                          )}
                        </motion.div>
                      </div>

                      {/* 右侧：工具信息 */}
                      <div className="col-span-12 sm:col-span-9 space-y-2 sm:space-y-3">
                        {/* 工具名称 */}
                        <div>
                          <h5
                            className="text-lg sm:text-xl md:text-2xl font-black tracking-wide mb-1"
                            style={{ color: getStatusColor(entry.status) }}
                          >
                            {entry.tool.name}
                          </h5>
                          <p className="text-gray-300 leading-relaxed text-xs sm:text-sm">
                            {entry.tool.description}
                          </p>
                        </div>

                        {/* 解锁信息 */}
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <span className="text-cyan-400 font-mono">UNLOCKS:</span>
                          <div
                            className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border font-mono font-bold text-xs"
                            style={{
                              borderColor: getStatusColor(entry.status),
                              color: getStatusColor(entry.status),
                              background: `${getStatusColor(entry.status)}15`
                            }}
                          >
                            {entry.tool.unlocksSong}
                          </div>
                        </div>

                        {/* 收集按钮 */}
                        <div className="pt-4">
                          {checkToolCollected(entry.tool.id) ? (
                            <div
                              className="w-full py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg border-2 font-mono font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2"
                              style={{
                                borderColor: '#00ff88',
                                color: '#00ff88',
                                background: 'rgba(0, 255, 136, 0.1)'
                              }}
                            >
                              <span>✅</span>
                              <span>COLLECTED</span>
                            </div>
                          ) : (
                            <motion.button
                              onClick={() => handleCollectTool(entry.tool.id)}
                              className="w-full py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg border-2 font-mono font-bold text-xs sm:text-sm transition-all duration-300"
                              style={{
                                borderColor: getStatusColor(entry.status),
                                color: getStatusColor(entry.status),
                                background: `${getStatusColor(entry.status)}15`
                              }}
                              whileHover={{
                                scale: 1.02,
                                background: `${getStatusColor(entry.status)}25`,
                                boxShadow: `0 0 25px ${getStatusColor(entry.status)}60`
                              }}
                              whileTap={{ scale: 0.98 }}
                              disabled={collectingTool === entry.tool.id}
                            >
                              {collectingTool === entry.tool.id ? '⚡ COLLECTING...' : '⭐ COLLECT TOOL'}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* 能量读数 */}
                  <div className="space-y-2">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs sm:text-sm font-mono text-cyan-400">
                        <span>MISSION ENERGY LEVEL</span>
                        <span>{entry.energyLevel}%</span>
                      </div>
                      <div className="h-2 sm:h-2.5 bg-black/50 rounded-full overflow-hidden border border-cyan-500/30">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(to right, ${getStatusColor(entry.status)}, rgba(0, 212, 255, 0.8))`,
                            boxShadow: `0 0 15px ${getStatusColor(entry.status)}`
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${entry.energyLevel}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 关闭按钮 */}
                  <div className="pt-1">
                    <button
                      onClick={() => setSelectedLog(null)}
                      className="w-full py-2 sm:py-2.5 border rounded-lg font-mono font-bold text-xs sm:text-sm transition-all duration-300"
                      style={{
                        borderColor: getStatusColor(entry.status),
                        color: getStatusColor(entry.status),
                        background: `${getStatusColor(entry.status)}10`
                      }}
                    >
                      CLOSE TRANSMISSION
                    </button>
                  </div>
                </div>

                {/* 边角装饰 */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: getStatusColor(entry.status) }} />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2" style={{ borderColor: getStatusColor(entry.status) }} />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2" style={{ borderColor: getStatusColor(entry.status) }} />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: getStatusColor(entry.status) }} />
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* 底部装饰 */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto mt-16 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-4 justify-center text-cyan-400 font-mono text-xs">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>END OF TRANSMISSION</span>
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </div>
      </motion.div>
    </section>
  );
}
