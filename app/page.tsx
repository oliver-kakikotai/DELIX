'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';
import AlbumGalaxy from '../components/AlbumGalaxy';
import RunawaySection from '../components/RunawaySection';
import StorySection from '../components/StorySection';
import ConstellationSection from '../components/ConstellationSection';
import Footer from '../components/Footer';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  // 只在首次访问时显示加载动画
  useEffect(() => {
    // 检查是否已经显示过加载动画
    const hasShownLoading = sessionStorage.getItem('hasShownLoading');

    if (!hasShownLoading) {
      // 首次访问，显示加载动画
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem('hasShownLoading', 'true');
      }, 2000); // 2秒加载时间

      return () => clearTimeout(timer);
    }
  }, []);
  return (
        <div className="min-h-screen relative bg-black w-full" style={{ touchAction: 'auto', overscrollBehavior: 'auto' }}>
      {/* 宇宙背景层 */}
      <div className="fixed inset-0 -z-10">
        {/* 主要星系背景 */}
        <div className="absolute inset-0 bg-gradient-radial from-purple-950/20 via-blue-950/30 to-black"></div>
        
        {/* 银河系螺旋臂效果 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-conic from-purple-500/15 via-transparent via-transparent to-purple-500/15 animate-spin" style={{ animation: 'spin 120s linear infinite' }}></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-conic from-blue-500/10 via-transparent via-transparent to-blue-500/10 animate-spin" style={{ animation: 'spin 180s linear infinite reverse' }}></div>
        </div>

        {/* 星云效果 */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-radial from-purple-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-radial from-blue-500/15 via-cyan-500/8 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-radial from-green-500/12 via-teal-500/6 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-radial from-orange-500/15 via-yellow-500/8 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }}></div>
        </div>

        {/* 大颗星星 */}
        <div className="absolute inset-0">
          <div className="absolute top-16 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-white shadow-sm"></div>
          <div className="absolute top-1/4 right-20 w-1 h-1 bg-blue-200 rounded-full animate-pulse shadow-blue-200 shadow-sm" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-16 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-pink-200 rounded-full animate-pulse shadow-pink-200 shadow-sm" style={{ animationDelay: '3s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-0.5 h-0.5 bg-cyan-200 rounded-full animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* 小星星群 */}
        <div className="absolute inset-0 opacity-40">
          {/* 星星簇1 */}
          <div className="absolute top-32 left-32">
            <div className="w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-2 left-3 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-4 left-1 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          </div>
          
          {/* 星星簇2 */}
          <div className="absolute top-48 right-48">
            <div className="w-0.5 h-0.5 bg-blue-200 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute top-3 left-2 w-0.5 h-0.5 bg-blue-200 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1 left-4 w-0.5 h-0.5 bg-blue-200 rounded-full animate-ping" style={{ animationDelay: '2.5s' }}></div>
          </div>
          
          {/* 星星簇3 */}
          <div className="absolute bottom-32 left-48">
            <div className="w-0.5 h-0.5 bg-purple-200 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
            <div className="absolute top-2 left-3 w-0.5 h-0.5 bg-purple-200 rounded-full animate-ping" style={{ animationDelay: '3.5s' }}></div>
            <div className="absolute top-4 left-1 w-0.5 h-0.5 bg-purple-200 rounded-full animate-ping" style={{ animationDelay: '4s' }}></div>
          </div>
          
          {/* 星星簇4 */}
          <div className="absolute bottom-48 right-32">
            <div className="w-0.5 h-0.5 bg-pink-200 rounded-full animate-ping" style={{ animationDelay: '4.5s' }}></div>
            <div className="absolute top-3 left-2 w-0.5 h-0.5 bg-pink-200 rounded-full animate-ping" style={{ animationDelay: '5s' }}></div>
            <div className="absolute top-1 left-4 w-0.5 h-0.5 bg-pink-200 rounded-full animate-ping" style={{ animationDelay: '5.5s' }}></div>
          </div>
        </div>

        {/* 流星效果 */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-0.5 h-0.5 bg-white rounded-full opacity-60">
            <div className="absolute -top-0.5 -left-8 w-8 h-0.5 bg-gradient-to-r from-transparent to-white opacity-50 animate-pulse" style={{ animationDelay: '10s' }}></div>
          </div>
          <div className="absolute top-1/3 right-1/4 w-0.5 h-0.5 bg-blue-200 rounded-full opacity-50">
            <div className="absolute -top-0.5 -left-6 w-6 h-0.5 bg-gradient-to-r from-transparent to-blue-200 opacity-40 animate-pulse" style={{ animationDelay: '15s' }}></div>
          </div>
        </div>

        {/* 远处的行星 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-24 right-24 w-8 h-8 bg-gradient-radial from-orange-400 to-red-600 rounded-full blur-sm animate-pulse" style={{ animationDelay: '8s' }}></div>
          <div className="absolute bottom-32 left-24 w-6 h-6 bg-gradient-radial from-blue-400 to-purple-600 rounded-full blur-sm animate-pulse" style={{ animationDelay: '12s' }}></div>
          <div className="absolute top-1/2 left-32 w-4 h-4 bg-gradient-radial from-green-400 to-teal-600 rounded-full blur-sm animate-pulse" style={{ animationDelay: '16s' }}></div>
        </div>

        {/* 宇宙尘埃效果 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/2 via-transparent to-purple/2 animate-pulse"></div>
        </div>
      </div>

      {/* 简单加载屏幕 */}
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <motion.h1
              className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-8"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              DELIX
            </motion.h1>
            <div className="flex gap-2 justify-center">
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-purple-500 rounded-full"
                  animate={{
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 固定导航栏 - 只在非加载状态显示 */}
      {!isLoading && <Navigation />}

      {/* 专辑星系界面 - 只在加载完成后显示 */}
      {!isLoading && <AlbumGalaxy />}

      {/* Runaway Section - 在 Footer 上面 */}
      {!isLoading && <RunawaySection />}

      {/* Story Section */}
      {!isLoading && <StorySection />}

      {/* Constellation Section */}
      {!isLoading && <ConstellationSection />}

      {/* Footer */}
      {!isLoading && <Footer />}
        </div>
  );
}