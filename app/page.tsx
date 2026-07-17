'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';
import CosmicVoyage from '../components/CosmicVoyage';
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

      {!isLoading && <CosmicVoyage />}

      {/* Footer */}
      {!isLoading && <Footer />}
    </div>
  );
}
