import type { Metadata } from "next";
import { Archivo, Yellowtail } from "next/font/google";
import "./globals.css";
import { AudioProvider } from '@/contexts/AudioContext';
import { UnlockProvider } from '@/contexts/UnlockContext';
import GlobalAudioPlayer from '@/components/GlobalAudioPlayer';

// Stand-in for "Bandit Condensed" (a paid Pangram Pangram display face) —
// Archivo is a free Google Font with the same bold-grotesque character, and
// its variable weight axis (100-900) covers everything from body text up to
// the near-black display weight the site's `font-black` headings already use.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

// Handwritten display face echoing the DELIX logo, used via `.font-script`
// for headline-level text (song titles use wordmark images instead).
const yellowtail = Yellowtail({ variable: "--font-yellowtail", subsets: ["latin"], weight: "400", display: "swap" });

export const metadata: Metadata = {
  title: "Runaway Rabbit - Original IP Character",
  description: "An original IP character full of vitality and adventurous spirit, combining traditional culture with modern street art.",
  keywords: ["original IP", "character design", "street art", "rabbit", "illustration", "anime"],
  authors: [{ name: "Rabbit Studio" }],
  creator: "Rabbit Studio",
  openGraph: {
    title: "Runaway Rabbit - Original IP Character",
    description: "An original IP character full of vitality and adventurous spirit",
    type: "website",
    locale: "en_US",
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
      </head>
      <body
        className={`${archivo.variable} ${yellowtail.variable} antialiased bg-black`}
      >
        <UnlockProvider>
          <AudioProvider>
            {children}
            <GlobalAudioPlayer />
          </AudioProvider>
        </UnlockProvider>
      </body>
    </html>
  );
}
