'use client';

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Song, albumData } from '@/data/albumData';

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
      if (loop) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
        playNext();
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
  }, [loop]);

  const startSong = (song: Song) => {
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
  };

  // 播放歌曲。相同歌曲时作为播放/暂停按钮使用，不同歌曲时切换到新歌曲。
  const playSong = (song: Song) => {
    if (!audioRef.current) return;

    if (currentSong?.id === song.id) {
      togglePlay();
      return;
    }

    startSong(song);
  };

  // 切换播放/暂停
  const togglePlay = () => {
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
  };

  // 暂停
  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  // 跳转到指定时间
  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // 设置音量
  const setVolume = (newVolume: number) => {
    if (!audioRef.current) return;
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    audioRef.current.volume = clampedVolume;
    setVolumeState(clampedVolume);
  };

  // 切换循环模式
  const toggleLoop = () => {
    setLoop(!loop);
  };

  // 播放下一首
  const playNext = () => {
    if (!currentSong) return;

    // 只播放已解锁的歌曲
    const unlockedSongs = albumData.songs.filter(song => song.unlocked);
    const currentIndex = unlockedSongs.findIndex(song => song.id === currentSong.id);

    if (currentIndex < 0) return;

    // 如果不是最后一首，播放下一首；否则循环到第一首
    const nextIndex = (currentIndex + 1) % unlockedSongs.length;
    playSong(unlockedSongs[nextIndex]);
  };

  // 播放上一首
  const playPrevious = () => {
    if (!currentSong) return;

    // 只播放已解锁的歌曲
    const unlockedSongs = albumData.songs.filter(song => song.unlocked);
    const currentIndex = unlockedSongs.findIndex(song => song.id === currentSong.id);

    if (currentIndex < 0) return;

    // 如果不是第一首，播放上一首；否则循环到最后一首
    const prevIndex = currentIndex === 0 ? unlockedSongs.length - 1 : currentIndex - 1;
    playSong(unlockedSongs[prevIndex]);
  };

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
