'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '@/contexts/AudioContext';

interface LyricLine {
  time: number;
  text: string;
}

interface LyricsDisplayProps {
  lyricsPath?: string;
  className?: string;
  /** The song world's accent colour (hex) — current-line glow + progress bar. */
  accent?: string;
}

export default function LyricsDisplay({ lyricsPath, className = '', accent = '#ffffff' }: LyricsDisplayProps) {
  const { currentSong, currentTime, seek } = useAudio();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [translateY, setTranslateY] = useState(0);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

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

  // 自动滚动到当前歌词行 - 使用 transform 而不是 scrollIntoView.
  // Looks the line up in the DOM via its data-line-index attribute at the
  // moment the effect runs, rather than through a ref populated by an inline
  // callback ref on each mapped line — that callback ref's identity changes
  // every render (new arrow function), and empirically React wasn't
  // reliably re-invoking it just because `currentLineIndex` changed without
  // the `lyrics` array itself changing, leaving the stored ref stale/null
  // and the centering offset never computed.
  useEffect(() => {
    if (currentLineIndex < 0 || !lyricsContainerRef.current) return;
    requestAnimationFrame(() => {
      const container = lyricsContainerRef.current;
      const currentLine = container?.querySelector<HTMLElement>(`[data-line-index="${currentLineIndex}"]`);

      if (container && currentLine) {
        const containerHeight = container.clientHeight;
        const lineOffsetTop = currentLine.offsetTop;
        const lineHeight = currentLine.clientHeight;

        // 计算需要的偏移量，让当前行居中
        const offset = containerHeight / 2 - lineOffsetTop - lineHeight / 2;
        setTranslateY(offset);
      }
    });
  }, [currentLineIndex]);

  // 点击歌词行跳转到对应时间
  const handleLineClick = (time: number) => {
    seek(time);
  };

  if (lyrics.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <p className="text-center text-sm uppercase tracking-[0.28em] text-white/45">
          No lyrics for this signal
        </p>
      </div>
    );
  }

  return (
    <div
      ref={lyricsContainerRef}
      className={`overflow-hidden ${className}`}
      style={{
        position: 'relative',
        // Soft fade at the top and bottom instead of a hard-edged box.
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
      }}
    >
      <motion.div
        className="px-2 py-24 md:px-4"
        animate={{ y: translateY }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {lyrics.map((line, index) => {
          const isCurrent = index === currentLineIndex;
          const isPast = index < currentLineIndex;

          return (
            <motion.div
              key={`${line.time}-${index}`}
              data-line-index={index}
              onClick={() => handleLineClick(line.time)}
              className={`relative my-1 cursor-pointer rounded-xl px-4 py-2.5 text-center transition-colors duration-300 hover:bg-white/[0.06] md:text-left ${
                isCurrent
                  ? 'text-2xl font-bold leading-snug text-white md:text-[1.75rem]'
                  : isPast
                    ? 'text-lg font-medium text-white/40'
                    : 'text-lg font-medium text-white/65'
              }`}
              style={{
                // Shadow keeps lines readable over the brighter song videos;
                // the current line also gets a glow in the song's colour.
                textShadow: isCurrent
                  ? `0 0 28px ${accent}99, 0 2px 12px rgba(0,0,0,0.85)`
                  : '0 2px 10px rgba(0,0,0,0.8)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, scale: isCurrent ? 1.02 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {line.text}

              {/* Progress through the current line, in the song's colour */}
              {isCurrent && index < lyrics.length - 1 && (
                <motion.div
                  className="mx-auto mt-2 h-0.5 max-w-[14rem] rounded-full md:mx-0"
                  style={{
                    transformOrigin: 'left',
                    background: `linear-gradient(90deg, ${accent}, ${accent}00)`,
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX: Math.min((currentTime - line.time) / (lyrics[index + 1].time - line.time), 1),
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
