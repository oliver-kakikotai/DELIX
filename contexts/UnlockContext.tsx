'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Song, albumData } from '@/data/albumData';

interface UnlockProgress {
  songId: number;
  completed: boolean; // 是否听完
  playCount: number; // 播放次数
}

interface UnlockStats {
  totalTimePlayed: number; // 总播放时长（秒）
  lyricsClickCount: number; // 歌词点击次数
  unlockedSongIds: number[]; // 已解锁的歌曲ID
  songProgress: Record<number, UnlockProgress>; // 每首歌的进度
  collectedTools: number[]; // 已收集的工具ID
}

interface UnlockContextType {
  stats: UnlockStats;
  unlockedSongs: Set<number>;
  checkUnlock: (songId: number) => boolean;
  unlockSong: (songId: number) => void;
  recordSongCompletion: (songId: number) => void;
  recordPlayTime: (seconds: number) => void;
  recordLyricsClick: () => void;
  getProgress: (songId: number) => number; // 获取解锁进度 (0-100)
  resetProgress: () => void; // 重置所有进度（用于测试）
  collectTool: (toolId: number) => void; // 收集工具
  checkToolCollected: (toolId: number) => boolean; // 检查工具是否已收集
}

const UnlockContext = createContext<UnlockContextType | undefined>(undefined);

const STORAGE_KEY = 'delix_unlock_stats';
const DATA_VERSION = 2; // 数据版本号，变更时会自动重置旧数据

// 默认统计数据
const defaultStats: UnlockStats = {
  totalTimePlayed: 0,
  lyricsClickCount: 0,
  unlockedSongIds: [], // 空数组，实际unlock状态从albumData读取
  songProgress: {},
  collectedTools: [] // 已收集的工具
};

export function UnlockProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<UnlockStats>(defaultStats);
  const [unlockedSongs, setUnlockedSongs] = useState<Set<number>>(new Set());

  // 从 localStorage 加载数据
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        let saved = localStorage.getItem(STORAGE_KEY);
        const savedVersion = localStorage.getItem(STORAGE_KEY + '_version');

        // 从 albumData 获取所有设置为 unlocked: true 的歌曲（作为基础状态）
        const baseUnlockedSongIds = albumData.songs
          .filter(song => song.unlocked)
          .map(song => song.id);

        // 版本检查：如果版本不匹配，清除旧数据
        if (saved && savedVersion !== String(DATA_VERSION)) {
          console.log('🔄 检测到旧版本数据，自动重置...');
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(STORAGE_KEY + '_version');
          saved = null; // 重新设置为无数据状态
        }

        console.log('🔓 UnlockContext 初始化:', {
          数据版本: DATA_VERSION,
          localStorage有数据: !!saved,
          albumData解锁的歌曲: baseUnlockedSongIds,
          albumData所有歌曲状态: albumData.songs.map(s => ({
            id: s.id,
            title: s.title,
            unlocked: s.unlocked
          }))
        });

        if (saved) {
          const parsed = JSON.parse(saved) as UnlockStats;

          // 只保留 localStorage 中通过工具解锁的歌曲
          const toolUnlockedIds = parsed.collectedTools?.map(toolId => {
            const toolToSongMap: Record<number, number> = {
              1: 2, // 工具1 (STELLAR NAVIGATOR) → The Real Reason
              3: 4, // 工具3 (TEMPORAL DECODER) → Salmon and Potatoes
              4: 5, // 工具4 (ASCENSION CORE) → The Ascension
              5: 1  // 工具5 (COSMIC AMPLIFIER) → Tomorrow
            };
            return toolToSongMap[toolId];
          }).filter(Boolean) || [];

          // 合并：基础解锁 + 工具解锁
          const initialUnlockedIds = Array.from(new Set([...baseUnlockedSongIds, ...toolUnlockedIds]));

          console.log('📦 从 localStorage 加载:', {
            已收集工具: parsed.collectedTools,
            工具解锁的歌曲: toolUnlockedIds,
            最终解锁的歌曲: initialUnlockedIds
          });

          setStats({
            totalTimePlayed: parsed.totalTimePlayed || 0,
            lyricsClickCount: parsed.lyricsClickCount || 0,
            songProgress: parsed.songProgress || {},
            collectedTools: parsed.collectedTools || [],
            unlockedSongIds: initialUnlockedIds
          });
          setUnlockedSongs(new Set(initialUnlockedIds));
        } else {
          // 没有保存的数据，只使用 albumData 中的预解锁状态
          console.log('🆕 无 localStorage 数据，使用默认状态:', {
            解锁的歌曲: baseUnlockedSongIds
          });

          setStats({
            ...defaultStats,
            unlockedSongIds: baseUnlockedSongIds
          });
          setUnlockedSongs(new Set(baseUnlockedSongIds));
        }
      } catch (error) {
        console.error('Failed to load unlock stats:', error);
      }
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
        localStorage.setItem(STORAGE_KEY + '_version', String(DATA_VERSION));
      } catch (error) {
        console.error('Failed to save unlock stats:', error);
      }
    }
  }, [stats]);

  // 检查歌曲是否已解锁
  const checkUnlock = (songId: number): boolean => {
    return unlockedSongs.has(songId);
  };

  // 手动解锁歌曲
  const unlockSong = (songId: number) => {
    if (!unlockedSongs.has(songId)) {
      const newUnlockedSongs = new Set(unlockedSongs);
      newUnlockedSongs.add(songId);
      setUnlockedSongs(newUnlockedSongs);

      setStats(prev => ({
        ...prev,
        unlockedSongIds: Array.from(newUnlockedSongs)
      }));
    }
  };

  // 记录歌曲完成
  const recordSongCompletion = (songId: number) => {
    setStats(prev => {
      const songProgress = prev.songProgress[songId] || {
        songId,
        completed: false,
        playCount: 0
      };

      const newProgress = {
        ...prev,
        songProgress: {
          ...prev.songProgress,
          [songId]: {
            ...songProgress,
            completed: true,
            playCount: songProgress.playCount + 1
          }
        }
      };

      // 检查是否解锁下一首歌（listen_previous条件）
      checkAndUnlockSongs(newProgress);

      return newProgress;
    });
  };

  // 记录播放时长
  const recordPlayTime = (seconds: number) => {
    setStats(prev => {
      const newStats = {
        ...prev,
        totalTimePlayed: prev.totalTimePlayed + seconds
      };

      // 检查基于时长的解锁条件
      checkAndUnlockSongs(newStats);

      return newStats;
    });
  };

  // 记录歌词点击
  const recordLyricsClick = () => {
    setStats(prev => {
      const newStats = {
        ...prev,
        lyricsClickCount: prev.lyricsClickCount + 1
      };

      // 检查基于点击次数的解锁条件
      checkAndUnlockSongs(newStats);

      return newStats;
    });
  };

  // 检查并解锁满足条件的歌曲
  const checkAndUnlockSongs = (currentStats: UnlockStats) => {
    albumData.songs.forEach(song => {
      // 已解锁的跳过
      if (unlockedSongs.has(song.id)) return;

      if (!song.unlockCondition) return;

      let shouldUnlock = false;

      switch (song.unlockCondition.type) {
        case 'auto':
          shouldUnlock = true;
          break;

        case 'listen_previous':
          // 检查上一首是否听完
          if (song.id > 1) {
            const previousSong = albumData.songs[song.id - 2]; // id从1开始，数组从0开始
            const prevProgress = currentStats.songProgress[previousSong.id];
            shouldUnlock = prevProgress?.completed || false;
          }
          break;

        case 'time_played':
          shouldUnlock = currentStats.totalTimePlayed >= (song.unlockCondition.target || 0);
          break;

        case 'lyrics_click':
          shouldUnlock = currentStats.lyricsClickCount >= (song.unlockCondition.target || 0);
          break;

        case 'listen_count':
          // 任意歌曲的播放次数总和
          const totalPlays = Object.values(currentStats.songProgress).reduce(
            (sum, progress) => sum + progress.playCount,
            0
          );
          shouldUnlock = totalPlays >= (song.unlockCondition.target || 0);
          break;

        case 'manual':
          // 手动解锁，不自动触发
          break;
      }

      if (shouldUnlock) {
        unlockSong(song.id);
      }
    });
  };

  // 获取解锁进度百分比
  const getProgress = (songId: number): number => {
    if (unlockedSongs.has(songId)) return 100;

    const song = albumData.songs.find(s => s.id === songId);
    if (!song || !song.unlockCondition) return 0;

    switch (song.unlockCondition.type) {
      case 'auto':
        return 100;

      case 'listen_previous':
        if (songId > 1) {
          const previousSong = albumData.songs[songId - 2];
          const prevProgress = stats.songProgress[previousSong.id];
          return prevProgress?.completed ? 100 : 0;
        }
        return 0;

      case 'time_played':
        const target = song.unlockCondition.target || 1;
        return Math.min(100, (stats.totalTimePlayed / target) * 100);

      case 'lyrics_click':
        const clickTarget = song.unlockCondition.target || 1;
        return Math.min(100, (stats.lyricsClickCount / clickTarget) * 100);

      case 'listen_count':
        const countTarget = song.unlockCondition.target || 1;
        const totalPlays = Object.values(stats.songProgress).reduce(
          (sum, progress) => sum + progress.playCount,
          0
        );
        return Math.min(100, (totalPlays / countTarget) * 100);

      default:
        return 0;
    }
  };

  // 重置所有进度
  const resetProgress = () => {
    // 从 albumData 获取默认解锁状态
    const baseUnlockedSongIds = albumData.songs
      .filter(song => song.unlocked)
      .map(song => song.id);

    console.log('🔄 重置进度，默认解锁:', baseUnlockedSongIds);

    const resetStats = {
      ...defaultStats,
      unlockedSongIds: baseUnlockedSongIds
    };

    setStats(resetStats);
    setUnlockedSongs(new Set(baseUnlockedSongIds));

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY + '_version');
      // 立即保存新的状态
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetStats));
      localStorage.setItem(STORAGE_KEY + '_version', String(DATA_VERSION));
    }
  };

  // 收集工具
  const collectTool = (toolId: number) => {
    setStats(prev => {
      if (prev.collectedTools.includes(toolId)) {
        return prev; // 已收集，不重复添加
      }

      const newCollectedTools = [...prev.collectedTools, toolId];

      // 工具到歌曲的映射关系
      const toolToSongMap: Record<number, number> = {
        1: 2, // 工具1 (STELLAR NAVIGATOR) → 解锁歌曲2 (The Real Reason)
        3: 4, // 工具3 (TEMPORAL DECODER) → 解锁歌曲4 (Salmon and Potatoes)
        4: 5, // 工具4 (ASCENSION CORE) → 解锁歌曲5 (The Ascension)
        5: 1  // 工具5 (COSMIC AMPLIFIER) → 解锁歌曲1 (Tomorrow)
      };

      // 收集工具后自动解锁对应歌曲
      const songToUnlock = toolToSongMap[toolId];
      if (songToUnlock && !unlockedSongs.has(songToUnlock)) {
        unlockSong(songToUnlock);
      }

      return {
        ...prev,
        collectedTools: newCollectedTools
      };
    });
  };

  // 检查工具是否已收集
  const checkToolCollected = (toolId: number): boolean => {
    return stats.collectedTools?.includes(toolId) || false;
  };

  const value: UnlockContextType = {
    stats,
    unlockedSongs,
    checkUnlock,
    unlockSong,
    recordSongCompletion,
    recordPlayTime,
    recordLyricsClick,
    getProgress,
    resetProgress,
    collectTool,
    checkToolCollected
  };

  return (
    <UnlockContext.Provider value={value}>
      {children}
    </UnlockContext.Provider>
  );
}

// 自定义 Hook
export function useUnlock() {
  const context = useContext(UnlockContext);
  if (context === undefined) {
    throw new Error('useUnlock must be used within an UnlockProvider');
  }
  return context;
}
