'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { albumData } from '@/data/albumData';

interface UnlockStats {
  unlockedSongIds: number[]; // 已解锁的歌曲ID
  collectedTools: number[]; // 已收集的工具ID
}

interface UnlockContextType {
  stats: UnlockStats;
  unlockedSongs: Set<number>;
  checkUnlock: (songId: number) => boolean;
  resetProgress: () => void; // 重置所有进度（用于测试）
  collectTool: (toolId: number) => void; // 收集工具
  checkToolCollected: (toolId: number) => boolean; // 检查工具是否已收集
}

const UnlockContext = createContext<UnlockContextType | undefined>(undefined);

const STORAGE_KEY = 'delix_unlock_stats';
const DATA_VERSION = 3; // 数据版本号，变更时会自动重置旧数据
const baseUnlockedSongIds = albumData.songs
  .filter(song => song.unlocked)
  .map(song => song.id);

// 默认统计数据
const defaultStats: UnlockStats = {
  unlockedSongIds: baseUnlockedSongIds,
  collectedTools: [] // 已收集的工具
};

const toolToSongMap: Record<number, number> = {
  1: 2, // 工具1 (STELLAR NAVIGATOR) → 解锁歌曲2 (The Real Reason)
  3: 4, // 工具3 (TEMPORAL DECODER) → 解锁歌曲4 (Salmon and Potatoes)
  4: 5, // 工具4 (ASCENSION CORE) → 解锁歌曲5 (The Ascension)
  5: 1  // 工具5 (COSMIC AMPLIFIER) → 解锁歌曲1 (Tomorrow)
};

export function UnlockProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<UnlockStats>(defaultStats);
  const [unlockedSongs, setUnlockedSongs] = useState<Set<number>>(new Set(baseUnlockedSongIds));

  // 从 localStorage 加载数据
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      let saved = localStorage.getItem(STORAGE_KEY);
      const savedVersion = localStorage.getItem(STORAGE_KEY + '_version');

      // 版本检查：如果版本不匹配，清除旧数据
      if (saved && savedVersion !== String(DATA_VERSION)) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY + '_version');
        saved = null; // 重新设置为无数据状态
      }

      if (saved) {
        const parsed = JSON.parse(saved) as UnlockStats;

        // 只保留 localStorage 中通过工具解锁的歌曲
        const toolUnlockedIds = (parsed.collectedTools ?? [])
          .map(toolId => toolToSongMap[toolId])
          .filter((id): id is number => Boolean(id));

        // 合并：基础解锁 + 工具解锁
        const initialUnlockedIds = Array.from(new Set([...baseUnlockedSongIds, ...toolUnlockedIds]));

        setStats({
          collectedTools: [], // reset each session so the pocket game replays; songs stay unlocked via unlockedSongIds
          unlockedSongIds: initialUnlockedIds
        });
        setUnlockedSongs(new Set(initialUnlockedIds));
      }
    } catch (error) {
      console.error('Failed to load unlock stats:', error);
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
      localStorage.setItem(STORAGE_KEY + '_version', String(DATA_VERSION));
    } catch (error) {
      console.error('Failed to save unlock stats:', error);
    }
  }, [stats]);

  // 检查歌曲是否已解锁
  const checkUnlock = useCallback(
    (songId: number): boolean => unlockedSongs.has(songId),
    [unlockedSongs]
  );

  // 重置所有进度
  const resetProgress = useCallback(() => {
    const resetStats: UnlockStats = {
      unlockedSongIds: baseUnlockedSongIds,
      collectedTools: []
    };

    setStats(resetStats);
    setUnlockedSongs(new Set(baseUnlockedSongIds));

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetStats));
      localStorage.setItem(STORAGE_KEY + '_version', String(DATA_VERSION));
    }
  }, []);

  // 收集工具
  const collectTool = useCallback((toolId: number) => {
    const songToUnlock = toolToSongMap[toolId];

    setUnlockedSongs(prev => {
      if (!songToUnlock || prev.has(songToUnlock)) return prev;
      const next = new Set(prev);
      next.add(songToUnlock);
      return next;
    });

    setStats(prev => {
      if (prev.collectedTools.includes(toolId)) {
        return prev; // 已收集，不重复添加
      }

      return {
        unlockedSongIds: songToUnlock
          ? Array.from(new Set([...prev.unlockedSongIds, songToUnlock]))
          : prev.unlockedSongIds,
        collectedTools: [...prev.collectedTools, toolId]
      };
    });
  }, []);

  // 检查工具是否已收集
  const checkToolCollected = useCallback(
    (toolId: number): boolean => stats.collectedTools.includes(toolId),
    [stats.collectedTools]
  );

  const value: UnlockContextType = {
    stats,
    unlockedSongs,
    checkUnlock,
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
