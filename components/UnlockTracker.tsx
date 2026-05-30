'use client';

import { useEffect, useRef } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { useUnlock } from '@/contexts/UnlockContext';

/**
 * UnlockTracker - 隐藏组件，用于跟踪音频播放进度并更新解锁状态
 * 这个组件不渲染任何UI，只负责连接 AudioContext 和 UnlockContext
 */
export default function UnlockTracker() {
  const { currentSong, isPlaying, currentTime, duration } = useAudio();
  const { recordSongCompletion, recordPlayTime } = useUnlock();

  const lastTimeRef = useRef(0);
  const hasCompletedRef = useRef<Set<number>>(new Set());

  // 跟踪播放时长
  useEffect(() => {
    if (isPlaying && currentSong) {
      const interval = setInterval(() => {
        // 每秒记录一次播放时长
        recordPlayTime(1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentSong, recordPlayTime]);

  // 检测歌曲是否播放完成
  useEffect(() => {
    if (!currentSong || !duration) return;

    // 当播放进度超过95%时，认为歌曲已完成
    const progressPercent = (currentTime / duration) * 100;

    if (progressPercent >= 95 && !hasCompletedRef.current.has(currentSong.id)) {
      recordSongCompletion(currentSong.id);
      hasCompletedRef.current.add(currentSong.id);
    }

    // 当切换歌曲或重新开始时，重置完成标记
    if (currentTime < lastTimeRef.current - 5) {
      // 时间倒退超过5秒，可能是切换歌曲或重新播放
      hasCompletedRef.current.delete(currentSong.id);
    }

    lastTimeRef.current = currentTime;
  }, [currentSong, currentTime, duration, recordSongCompletion]);

  // 这个组件不渲染任何内容
  return null;
}
