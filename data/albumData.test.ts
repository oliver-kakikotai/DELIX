import { describe, expect, it } from 'vitest';
import {
  albumData,
  getSongBySlug,
  getSongById,
  getUnlockedSongs,
  getLockedSongs,
} from './albumData';

describe('albumData integrity', () => {
  it('has a unique slug per song', () => {
    const slugs = albumData.songs.map((song) => song.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('has a unique id per song', () => {
    const ids = albumData.songs.map((song) => song.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('reports totalSongs matching the actual song count', () => {
    expect(albumData.totalSongs).toBe(albumData.songs.length);
  });
});

describe('getSongBySlug', () => {
  it('finds a song by its slug', () => {
    expect(getSongBySlug('tomorrow')?.title).toBe('Tomorrow');
  });

  it('returns undefined for an unknown slug', () => {
    expect(getSongBySlug('does-not-exist')).toBeUndefined();
  });
});

describe('getSongById', () => {
  it('finds a song by its id', () => {
    expect(getSongById(1)?.slug).toBe('tomorrow');
  });

  it('returns undefined for an unknown id', () => {
    expect(getSongById(999)).toBeUndefined();
  });
});

describe('getUnlockedSongs / getLockedSongs', () => {
  it('partitions every song into exactly one of unlocked or locked', () => {
    const unlocked = getUnlockedSongs();
    const locked = getLockedSongs();
    expect(unlocked.length + locked.length).toBe(albumData.songs.length);
    expect(unlocked.every((song) => song.unlocked)).toBe(true);
    expect(locked.every((song) => !song.unlocked)).toBe(true);
  });
});
