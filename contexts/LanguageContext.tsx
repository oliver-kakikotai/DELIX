// contexts/LanguageContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// 语言类型定义
export type Language = 'en' | 'zh' | 'ja';

// 全局翻译配置
export const translations = {
  en: {
    // Navigation
    characterIntro: 'Character',
    storyBackground: 'Story',
    gallery: 'Gallery',
    contact: 'Contact',
    
    // Main Content
    runawayRabbit: 'Runaway',
    rabbit: 'Rabbit',
    description: 'An original IP character full of vitality and adventurous spirit, combining traditional culture with the unique charm of modern street art.',
    exploreCharacter: 'Explore Character',
    viewWorks: 'View Gallery',
    
    // Stats
    originalDesigns: 'Original Designs',
    followers: 'Followers',
    projects: 'Projects',
    
    // Character Card
    streetArtRabbit: 'Street Art Rabbit',
    adventurousSpirit: 'Adventurous',
    streetArt: 'Street Art',
    creativity: 'Creative',
    clickToSeeMore: 'Click to see more',
    
    // Floating Buttons
    play: 'Play',
    pause: 'Pause',
    
    // Cookie Notice
    cookieTitle: '🍪 We value your privacy',
    cookieDescription: 'We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.',
    customize: 'Customize',
    rejectAll: 'Reject All',
    acceptAll: 'Accept All',
    privacyPolicy: 'Privacy Policy',
    learnMore: 'Learn more in our',
    
    // General
    brandName: 'Runaway Rabbit · Original IP',
    loading: 'Loading...',
    artworkAlt: 'Runaway Rabbit Original Artwork'
  },
  zh: {
    // Navigation
    characterIntro: '角色介绍',
    storyBackground: '故事背景',
    gallery: '作品集',
    contact: '联系我们',
    
    // Main Content
    runawayRabbit: '逃跑的',
    rabbit: '兔子',
    description: '一个充满活力和冒险精神的原创IP角色，融合了传统文化与现代街头艺术的独特魅力。',
    exploreCharacter: '探索角色',
    viewWorks: '查看作品',
    
    // Stats
    originalDesigns: '原创设计',
    followers: '粉丝关注',
    projects: '合作项目',
    
    // Character Card
    streetArtRabbit: 'Street Art Rabbit',
    adventurousSpirit: '冒险精神',
    streetArt: '街头艺术',
    creativity: '创意无限',
    clickToSeeMore: '点击查看更多',
    
    // Floating Buttons
    play: '播放',
    pause: '暂停',
    
    // Cookie Notice
    cookieTitle: '🍪 我们重视您的隐私',
    cookieDescription: '我们使用cookies来增强您的浏览体验，提供个性化广告或内容，并分析我们的流量。点击"接受全部"，即表示您同意我们使用cookies。',
    customize: '自定义',
    rejectAll: '拒绝全部',
    acceptAll: '接受全部',
    privacyPolicy: '隐私政策',
    learnMore: '了解更多请查看我们的',
    
    // General
    brandName: '逃跑兔 · 原创IP',
    loading: '加载中...',
    artworkAlt: '逃跑兔原创作品'
  },
  ja: {
    // Navigation
    characterIntro: 'キャラクター',
    storyBackground: 'ストーリー',
    gallery: 'ギャラリー',
    contact: 'お問い合わせ',
    
    // Main Content
    runawayRabbit: '逃走する',
    rabbit: 'うさぎ',
    description: '活力と冒険心に満ちたオリジナルIPキャラクター、伝統文化と現代ストリートアートの独特な魅力を融合。',
    exploreCharacter: 'キャラクター探索',
    viewWorks: 'ギャラリー表示',
    
    // Stats
    originalDesigns: 'オリジナルデザイン',
    followers: 'フォロワー',
    projects: 'コラボプロジェクト',
    
    // Character Card
    streetArtRabbit: 'Street Art Rabbit',
    adventurousSpirit: '冒険精神',
    streetArt: 'ストリートアート',
    creativity: 'クリエイティブ',
    clickToSeeMore: 'クリックして詳細を見る',
    
    // Floating Buttons
    play: '再生',
    pause: '一時停止',
    
    // Cookie Notice
    cookieTitle: '🍪 プライバシーを大切にしています',
    cookieDescription: 'ブラウジング体験を向上させ、パーソナライズされた広告やコンテンツを提供し、トラフィックを分析するためにクッキーを使用しています。「すべて受け入れる」をクリックすると、クッキーの使用に同意したことになります。',
    customize: 'カスタマイズ',
    rejectAll: 'すべて拒否',
    acceptAll: 'すべて受け入れる',
    privacyPolicy: 'プライバシーポリシー',
    learnMore: '詳細については',
    
    // General
    brandName: '逃走うさぎ · オリジナルIP',
    loading: '読み込み中...',
    artworkAlt: '逃走うさぎオリジナル作品'
  }
};

// 语言选项配置
export const languageOptions = [
  { code: 'en' as Language, label: 'EN', flag: '🇺🇸', name: 'English' },
  { code: 'zh' as Language, label: '中', flag: '🇨🇳', name: '中文' },
  { code: 'ja' as Language, label: '日', flag: '🇯🇵', name: '日本語' }
];

// Context 类型定义
interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  getCurrentLangOption: () => typeof languageOptions[0];
}

// 创建 Context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider 组件
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en'); // 默认英语
  const [isClient, setIsClient] = useState(false);

  // 确保在客户端加载
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 从 localStorage 读取语言设置
  useEffect(() => {
    if (isClient) {
      try {
        const savedLanguage = localStorage.getItem('preferred-language') as Language;
        if (savedLanguage && ['en', 'zh', 'ja'].includes(savedLanguage)) {
          setCurrentLanguage(savedLanguage);
          console.log('已加载保存的语言:', savedLanguage);
        }
      } catch (error) {
        console.warn('无法从 localStorage 读取语言设置:', error);
      }
    }
  }, [isClient]);

  // 保存语言设置到 localStorage
  const setLanguage = (lang: Language) => {
    console.log('切换语言到:', lang);
    setCurrentLanguage(lang);
    
    if (isClient) {
      try {
        localStorage.setItem('preferred-language', lang);
        console.log('语言设置已保存到 localStorage:', lang);
      } catch (error) {
        console.warn('无法保存语言设置到 localStorage:', error);
      }
    }
  };

  // 获取当前语言的翻译
  const t = translations[currentLanguage];

  // 获取当前语言选项
  const getCurrentLangOption = () => {
    return languageOptions.find(opt => opt.code === currentLanguage) || languageOptions[0];
  };

  const value = {
    currentLanguage,
    setLanguage,
    t,
    getCurrentLangOption
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// 自定义 Hook
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}