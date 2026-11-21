'use client';

import { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { Song, albumData } from '@/data/albumData';
import { useUnlock } from './UnlockContext';

interface AudioContextType {
  // 当前播放的歌曲
  currentSong: Song | null;
  // 播放状态
  isPlaying: boolean;
  // 当前播放时间（秒）
  currentTime: number;
  // 总时长（秒）
  duration: number;
  // 音量 (0-1)
  volume: number;
  // 循环模式
  loop: boolean;

  // 方法
  playSong: (song: Song) => void;
  startSong: (song: Song) => void;
  togglePlay: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleLoop: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [loop, setLoop] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Next/previous step through the songs this visitor has unlocked
  // (UnlockContext), not just the ones unlocked by default in albumData.
  const { checkUnlock } = useUnlock();
  // The 'ended' listener is attached once, so it reads the latest loop
  // setting and the auto-advance function through refs. (It used to capture the first
  // render's playNext — when nothing was playing yet — so a finished song
  // never advanced; and re-attaching on every loop toggle recreated the
  // <audio> element.)
  const loopRef = useRef(loop);
  const autoAdvanceRef = useRef<() => void>(() => {});

  // 初始化音频元素
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    // 监听时间更新
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    // 监听元数据加载（获取总时长）
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    // 监听播放结束
    const handleEnded = () => {
      if (loopRef.current) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
        autoAdvanceRef.current();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- create the element once; initial volume only
  }, []);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  const startSong = useCallback((song: Song) => {
    if (!audioRef.current) return;

    if (currentSong?.id === song.id) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error('Playback error:', error);
          setIsPlaying(false);
        });
      return;
    }

    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(0);
    audioRef.current.pause();
    audioRef.current.src = song.audioPath;
    audioRef.current.load();

    audioRef.current.addEventListener('canplay', () => {
      audioRef.current?.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error('Playback error:', error);
          setIsPlaying(false);
        });
    }, { once: true });

    setIsPlaying(true);
  }, [currentSong]);

  // 切换播放/暂停
  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error('Playback error:', error);
          setIsPlaying(false);
        });
    }
  }, [currentSong, isPlaying]);

  // 播放歌曲。相同歌曲时作为播放/暂停按钮使用，不同歌曲时切换到新歌曲。
  const playSong = useCallback((song: Song) => {
    if (!audioRef.current) return;

    if (currentSong?.id === song.id) {
      togglePlay();
      return;
    }

    startSong(song);
  }, [currentSong, togglePlay, startSong]);

  // 暂停
  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  // 跳转到指定时间
  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  // 设置音量
  const setVolume = useCallback((newVolume: number) => {
    if (!audioRef.current) return;
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    audioRef.current.volume = clampedVolume;
    setVolumeState(clampedVolume);
  }, []);

  // 切换循环模式
  const toggleLoop = useCallback(() => {
    setLoop((prev) => !prev);
  }, []);

  // 播放下一首
  const playNext = useCallback(() => {
    if (!currentSong) return;

    // 只播放已解锁的歌曲
    const unlockedSongs = albumData.songs.filter(song => checkUnlock(song.id));
    const currentIndex = unlockedSongs.findIndex(song => song.id === currentSong.id);

    if (currentIndex < 0) return;

    // 如果不是最后一首，播放下一首；否则循环到第一首
    const nextIndex = (currentIndex + 1) % unlockedSongs.length;
    playSong(unlockedSongs[nextIndex]);
  }, [currentSong, playSong, checkUnlock]);

  // When a song ends: play the next *unlocked* song in album order, and stop
  // after the last one — no wrap-around, and a lone unlocked song doesn't
  // repeat (the player's loop button is there for that). Unlike playNext
  // (the ⏭ button), which wraps.
  const autoAdvance = useCallback(() => {
    if (!currentSong) return;
    const unlockedSongs = albumData.songs.filter(song => checkUnlock(song.id));
    const currentIndex = unlockedSongs.findIndex(song => song.id === currentSong.id);
    const next = currentIndex >= 0 ? unlockedSongs[currentIndex + 1] : undefined;
    if (next) startSong(next);
  }, [currentSong, checkUnlock, startSong]);

  useEffect(() => {
    autoAdvanceRef.current = autoAdvance;
  }, [autoAdvance]);

  // 播放上一首
  const playPrevious = useCallback(() => {
    if (!currentSong) return;

    // 只播放已解锁的歌曲
    const unlockedSongs = albumData.songs.filter(song => checkUnlock(song.id));
    const currentIndex = unlockedSongs.findIndex(song => song.id === currentSong.id);

    if (currentIndex < 0) return;

    // 如果不是第一首，播放上一首；否则循环到最后一首
    const prevIndex = currentIndex === 0 ? unlockedSongs.length - 1 : currentIndex - 1;
    playSong(unlockedSongs[prevIndex]);
  }, [currentSong, playSong, checkUnlock]);

  const value: AudioContextType = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    loop,
    playSong,
    startSong,
    togglePlay,
    pause,
    seek,
    setVolume,
    toggleLoop,
    playNext,
    playPrevious,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

// 自定义 Hook
export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
