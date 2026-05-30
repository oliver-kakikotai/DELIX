// DELIX 专辑数据配置

// 解锁条件类型
export type UnlockConditionType =
  | 'auto' // 自动解锁（第一首歌）
  | 'listen_previous' // 听完上一首
  | 'listen_count' // 听歌次数
  | 'time_played' // 播放总时长
  | 'lyrics_click' // 点击歌词次数
  | 'manual'; // 手动解锁（用于测试）

export interface UnlockCondition {
  type: UnlockConditionType;
  target?: number; // 目标值（如次数、时长等）
  description: {
    en: string;
    zh: string;
    ja: string;
  };
}

export interface Song {
  id: number;
  title: string;
  titleEn: string;
  slug: string; // URL友好的标识符
  audioPath: string;
  lyricsPath: string;
  coverPath?: string;
  planetImage?: string; // 星球图片路径
  duration?: string; // 歌曲时长 "3:45"
  unlocked: boolean; // 是否解锁
  color?: string; // 主题色
  unlockCondition?: UnlockCondition; // 解锁条件
  intro?: string; // 歌曲简介
  description?: {
    en: string;
    zh: string;
    ja: string;
  };
}

export interface Album {
  title: string;
  artist: string;
  releaseYear: number;
  coverPath: string;
  totalSongs: number;
  songs: Song[];
}

// DELIX 专辑配置
export const albumData: Album = {
  title: "DELIX",
  artist: "Runaway Rabbit",
  releaseYear: 2024,
  coverPath: "/images/album-cover.jpg", // 专辑封面
  totalSongs: 5,
  songs: [
    {
      id: 1,
      title: "Tomorrow",
      titleEn: "Tomorrow",
      slug: "tomorrow",
      audioPath: "/audio/songs/Tomorrow.mp3",
      lyricsPath: "/audio/lyrics/tomorrow-sample.lrc",
      coverPath: "/audio/covers/01-tomorrow.jpg",
      duration: "3:30",
      unlocked: false,
      color: "#FFD700", // 金色
      intro: "For you who want to work hard but are attached to comfort",
      unlockCondition: {
        type: 'manual',
        description: {
          en: "Collect the COSMIC AMPLIFIER tool",
          zh: "收集宇宙放大器工具",
          ja: "コスミックアンプリファイアツールを集める"
        }
      },
      description: {
        en: "A journey into tomorrow",
        zh: "通往明天的旅程",
        ja: "明日への旅"
      }
    },
    {
      id: 2,
      title: "The Real Reason",
      titleEn: "The Real Reason",
      slug: "the-real-reason",
      audioPath: "/audio/songs/The Real Reason version4.mp3",
      lyricsPath: "/audio/lyrics/02-the-real-reason.lrc",
      coverPath: "/audio/covers/02-the-real-reason.jpg",
      planetImage: "/images/planet3.png",
      duration: "4:15",
      unlocked: false,
      color: "#9B59B6", // 紫色
      intro: "When you finally understand why you keep running away",
      unlockCondition: {
        type: 'manual',
        description: {
          en: "Collect the STELLAR NAVIGATOR tool",
          zh: "收集星际导航仪工具",
          ja: "ステラナビゲーターツールを集める"
        }
      },
      description: {
        en: "Discovering the truth within",
        zh: "发现内心的真相",
        ja: "心の中の真実を発見"
      }
    },
    {
      id: 3,
      title: "Third Person",
      titleEn: "Third Person",
      slug: "third-person",
      audioPath: "/audio/songs/Third Person.mp3",
      lyricsPath: "/audio/lyrics/03-third-person.lrc",
      coverPath: "/audio/covers/03-third-person.jpg",
      planetImage: "/images/planet2.png",
      duration: "3:52",
      unlocked: true,
      color: "#3498DB", // 蓝色
      intro: "Sometimes you need to step back and see yourself clearly",
      unlockCondition: {
        type: 'auto',
        description: {
          en: "Unlocked by default",
          zh: "默认解锁",
          ja: "デフォルトで解放"
        }
      },
      description: {
        en: "Watching from the outside",
        zh: "从外部观察",
        ja: "外から見る"
      }
    },
    {
      id: 4,
      title: "Salmon and Potatoes",
      titleEn: "Salmon and Potatoes",
      slug: "salmon-and-potatoes",
      audioPath: "/audio/songs/potato and  salmon version2.mp3",
      lyricsPath: "/audio/lyrics/04-salmon-and-potatoes.lrc",
      coverPath: "/audio/covers/04-salmon-and-potatoes.jpg",
      planetImage: "/images/planet4.png",
      duration: "3:20",
      unlocked: false,
      color: "#E74C3C", // 红橙色
      intro: "Life's simple joys taste better when shared with someone special",
      unlockCondition: {
        type: 'manual',
        description: {
          en: "Collect the TEMPORAL DECODER tool",
          zh: "收集时空解码器工具",
          ja: "テンポラルデコーダーツールを集める"
        }
      },
      description: {
        en: "A tale of simple pleasures",
        zh: "简单快乐的故事",
        ja: "シンプルな喜びの物語"
      }
    },
    {
      id: 5,
      title: "The Ascension",
      titleEn: "The Ascension",
      slug: "the-ascension",
      audioPath: "/audio/songs/The Ascension.mp3",
      lyricsPath: "/audio/lyrics/05-the-ascension.lrc",
      coverPath: "/audio/covers/05-the-ascension.jpg",
      planetImage: "/images/space.png",
      duration: "4:00",
      unlocked: false,
      color: "#1ABC9C", // 青绿色
      intro: "Rising above, reaching for the stars",
      unlockCondition: {
        type: 'manual',
        description: {
          en: "Collect the ASCENSION CORE tool",
          zh: "收集飞升核心工具",
          ja: "アセンションコアツールを集める"
        }
      },
      description: {
        en: "A journey to new heights",
        zh: "通向新高度的旅程",
        ja: "新たな高みへの旅"
      }
    }
  ]
};

// 辅助函数：根据 slug 获取歌曲
export const getSongBySlug = (slug: string): Song | undefined => {
  return albumData.songs.find(song => song.slug === slug);
};

// 辅助函数：根据 ID 获取歌曲
export const getSongById = (id: number): Song | undefined => {
  return albumData.songs.find(song => song.id === id);
};

// 辅助函数：获取已解锁的歌曲
export const getUnlockedSongs = (): Song[] => {
  return albumData.songs.filter(song => song.unlocked);
};

// 辅助函数：获取锁定的歌曲
export const getLockedSongs = (): Song[] => {
  return albumData.songs.filter(song => !song.unlocked);
};
