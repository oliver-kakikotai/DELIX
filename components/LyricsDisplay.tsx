'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '@/contexts/AudioContext';
import { useUnlock } from '@/contexts/UnlockContext';

interface LyricLine {
  time: number;
  text: string;
}

interface LyricsDisplayProps {
  lyricsPath?: string;
  className?: string;
}

export default function LyricsDisplay({ lyricsPath, className = '' }: LyricsDisplayProps) {
  const { currentSong, currentTime, seek } = useAudio();
  const { recordLyricsClick } = useUnlock();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [translateY, setTranslateY] = useState(0);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const currentLineRef = useRef<HTMLDivElement>(null);
  const lyricsRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 解析LRC格式歌词
  const parseLRC = (lrcText: string): LyricLine[] => {
    const lines = lrcText.split('\n');
    const parsedLyrics: LyricLine[] = [];

    lines.forEach(line => {
      // 匹配 [mm:ss.xx] 格式的时间戳
      const timeMatch = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\]/);
      if (timeMatch) {
        const minutes = parseInt(timeMatch[1]);
        const seconds = parseInt(timeMatch[2]);
        const centiseconds = parseInt(timeMatch[3]);
        const time = minutes * 60 + seconds + centiseconds / 100;

        // 提取歌词文本（去除时间戳）
        const text = line.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, '').trim();

        if (text) {
          parsedLyrics.push({ time, text });
        }
      }
    });

    // 按时间排序
    return parsedLyrics.sort((a, b) => a.time - b.time);
  };

  // 加载歌词文件
  useEffect(() => {
    if (!currentSong?.lyricsPath && !lyricsPath) {
      setLyrics([]);
      setCurrentLineIndex(-1);
      setTranslateY(0);
      return;
    }

    const path = lyricsPath || currentSong?.lyricsPath;
    if (!path) return;

    fetch(path)
      .then(response => response.text())
      .then(text => {
        const parsedLyrics = parseLRC(text);
        setLyrics(parsedLyrics);
        setCurrentLineIndex(-1);
        setTranslateY(0);
        // 初始化 refs 数组
        lyricsRefs.current = new Array(parsedLyrics.length).fill(null);
      })
      .catch(error => {
        console.error('Error loading lyrics:', error);
        setLyrics([]);
      });
  }, [currentSong, lyricsPath]);

  // 根据当前播放时间更新当前歌词行
  useEffect(() => {
    if (lyrics.length === 0) {
      setCurrentLineIndex(-1);
      return;
    }

    // 找到当前应该显示的歌词行
    let index = -1;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        index = i;
        break;
      }
    }

    if (index !== currentLineIndex) {
      setCurrentLineIndex(index);
    }
  }, [currentTime, lyrics, currentLineIndex]);

  // 自动滚动到当前歌词行 - 使用 transform 而不是 scrollIntoView
  useEffect(() => {
    if (currentLineIndex >= 0 && lyricsRefs.current[currentLineIndex] && lyricsContainerRef.current) {
      requestAnimationFrame(() => {
        const container = lyricsContainerRef.current;
        const currentLine = lyricsRefs.current[currentLineIndex];

        if (container && currentLine) {
          const containerHeight = container.clientHeight;
          const lineOffsetTop = currentLine.offsetTop;
          const lineHeight = currentLine.clientHeight;

          // 计算需要的偏移量，让当前行居中
          const offset = containerHeight / 2 - lineOffsetTop - lineHeight / 2;
          setTranslateY(offset);
        }
      });
    }
  }, [currentLineIndex]);

  // 点击歌词行跳转到对应时间
  const handleLineClick = (time: number) => {
    seek(time);
    recordLyricsClick(); // 记录歌词点击，用于解锁系统
  };

  if (lyrics.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <p className="text-gray-400 text-center">
          No lyrics available
        </p>
      </div>
    );
  }

  return (
    <div
      ref={lyricsContainerRef}
      className={`overflow-hidden ${className}`}
      style={{ position: 'relative' }}
    >
      <motion.div
        className="py-20 px-6"
        animate={{ y: translateY }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {lyrics.map((line, index) => {
          const isCurrent = index === currentLineIndex;
          const isPast = index < currentLineIndex;
          const isFuture = index > currentLineIndex;

          return (
            <motion.div
              key={`${line.time}-${index}`}
              ref={(el) => {
                lyricsRefs.current[index] = el;
                if (isCurrent) currentLineRef.current = el;
              }}
              onClick={() => handleLineClick(line.time)}
              className={`
                relative py-3 px-4 my-2 rounded-lg cursor-pointer transition-all duration-300
                ${isCurrent ? 'text-white text-2xl font-bold' : ''}
                ${isPast ? 'text-gray-500 text-lg' : ''}
                ${isFuture ? 'text-gray-600 text-lg' : ''}
                hover:bg-white/5 hover:text-white
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isCurrent ? 1 : isFuture ? 0.5 : 0.3,
                y: 0,
                scale: isCurrent ? 1.05 : 1
              }}
              transition={{ duration: 0.3 }}
            >
              {/* 当前行的发光效果 */}
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              <div className="relative z-10 text-center">
                {line.text}
              </div>

              {/* 进度指示器（仅当前行显示） */}
              {isCurrent && index < lyrics.length - 1 && (
                <motion.div
                  className="mt-2 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX: lyrics[index + 1]
                      ? Math.min((currentTime - line.time) / (lyrics[index + 1].time - line.time), 1)
                      : 1
                  }}
                  style={{ transformOrigin: 'left' }}
                />
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
