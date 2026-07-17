import type { Metadata } from "next";
import { Syne } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AudioProvider } from '@/contexts/AudioContext';
import { UnlockProvider } from '@/contexts/UnlockContext';
import GlobalAudioPlayer from '@/components/GlobalAudioPlayer';
import UnlockTracker from '@/components/UnlockTracker';

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Runaway Rabbit - Original IP Character | 逃跑兔 - 原创IP角色 | 逃走うさぎ - オリジナルIPキャラクター",
  description: "An original IP character full of vitality and adventurous spirit, combining traditional culture with modern street art. | 一个充满活力和冒险精神的原创IP角色，融合了传统文化与现代街头艺术的独特魅力。 | 活力と冒険心に満ちたオリジナルIPキャラクター。",
  keywords: ["original IP", "character design", "street art", "rabbit", "illustration", "anime", "原创IP", "角色设计", "街头艺术", "兔子", "插画", "动漫", "オリジナルIP", "キャラクターデザイン", "ストリートアート", "うさぎ", "イラスト", "アニメ"],
  authors: [{ name: "Rabbit Studio" }],
  creator: "Rabbit Studio",
  openGraph: {
    title: "Runaway Rabbit - Original IP Character",
    description: "An original IP character full of vitality and adventurous spirit",
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_CN", "ja_JP"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Runaway Rabbit - Original IP Character",
    description: "An original IP character full of vitality and adventurous spirit",
  },
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth bg-black">
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="alternate" hrefLang="en" href="/en" />
        <link rel="alternate" hrefLang="zh" href="/zh" />
        <link rel="alternate" hrefLang="ja" href="/ja" />
        <link rel="alternate" hrefLang="x-default" href="/" />
      </head>
      <body
        className={`${syne.variable} antialiased bg-black`}
      >
        <UnlockProvider>
          <AudioProvider>
            <LanguageProvider>
              {children}
              <GlobalAudioPlayer />
              <UnlockTracker />
            </LanguageProvider>
          </AudioProvider>
        </UnlockProvider>
      </body>
    </html>
  );
}