import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { UnlockProvider, useUnlock } from './UnlockContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <UnlockProvider>{children}</UnlockProvider>
);

beforeEach(() => {
  localStorage.clear();
});

describe('UnlockContext', () => {
  it('starts with only the auto-unlock song (id 3) unlocked', () => {
    const { result } = renderHook(() => useUnlock(), { wrapper });
    expect(result.current.checkUnlock(3)).toBe(true);
    expect(result.current.checkUnlock(1)).toBe(false);
    expect(result.current.checkUnlock(2)).toBe(false);
  });

  it('collectTool unlocks the song mapped to that tool', () => {
    const { result } = renderHook(() => useUnlock(), { wrapper });
    expect(result.current.checkUnlock(2)).toBe(false);

    act(() => {
      result.current.collectTool(1); // STELLAR NAVIGATOR -> song 2
    });

    expect(result.current.checkUnlock(2)).toBe(true);
    expect(result.current.checkToolCollected(1)).toBe(true);
  });

  it('does not add a duplicate entry when a tool is collected twice', () => {
    const { result } = renderHook(() => useUnlock(), { wrapper });

    act(() => {
      result.current.collectTool(5);
      result.current.collectTool(5);
    });

    expect(result.current.stats.collectedTools.filter((id) => id === 5)).toHaveLength(1);
  });

  it('resetProgress reverts collected tools and unlocked songs to defaults', () => {
    const { result } = renderHook(() => useUnlock(), { wrapper });

    act(() => {
      result.current.collectTool(1);
    });
    expect(result.current.checkUnlock(2)).toBe(true);

    act(() => {
      result.current.resetProgress();
    });

    expect(result.current.checkUnlock(2)).toBe(false);
    expect(result.current.checkToolCollected(1)).toBe(false);
  });

  it('keeps a tool-unlocked song unlocked across a remount, but resets collectedTools for a fresh session', async () => {
    const first = renderHook(() => useUnlock(), { wrapper });
    act(() => {
      first.result.current.collectTool(1); // unlocks song 2
    });
    expect(first.result.current.checkToolCollected(1)).toBe(true);
    first.unmount();

    const second = renderHook(() => useUnlock(), { wrapper });
    await waitFor(() => expect(second.result.current.checkUnlock(2)).toBe(true));
    // collectedTools intentionally resets each session so the pocket
    // recovery game replays, while the song unlock itself persists.
    expect(second.result.current.checkToolCollected(1)).toBe(false);
  });
});
