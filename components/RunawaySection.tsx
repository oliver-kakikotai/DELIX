'use client';

import { motion } from 'framer-motion';

// 生成固定的星星位置，避免 hydration 错误
const generateStarPositions = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    left: (i * 37 + 17) % 100,
    top: (i * 73 + 29) % 100,
    duration: 2 + ((i * 23) % 30) / 10,
    delay: ((i * 41) % 50) / 10,
  }));
};

const starPositions = generateStarPositions();

export default function RunawaySection() {
  return (
    <section className="relative w-full overflow-hidden bg-black min-h-[600px] md:min-h-[700px] lg:min-h-[800px]">
      {/* 背景图片 - 完整显示 */}
      <img
        src="/images/runaway.png"
        alt="Runaway Rabbit"
        className="w-full h-full object-cover absolute inset-0"
      />

      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-[1]" />

      {/* 装饰星星 */}
      <div className="absolute inset-0 pointer-events-none z-[2]">
        {starPositions.map((star, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 md:w-1 md:h-1 bg-white rounded-full"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay
            }}
          />
        ))}
      </div>

      {/* 内容区域 - 绝对定位覆盖在图片上 */}
      <div className="absolute inset-0 z-10 flex items-start md:items-center py-4 md:py-12 lg:py-16">
        <div className="container mx-auto px-1 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 lg:gap-12 items-start md:items-center max-w-6xl mx-auto">

          {/* 左侧：照片 */}
          <motion.div
            className="flex justify-start lg:justify-end order-1 lg:order-1 ml-1 lg:ml-0"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="relative">
              {/* 发光效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl blur-2xl"></div>

              {/* 照片 */}
              <img
                src="/images/profile.jpg"
                alt="Profile"
                className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 object-cover rounded-2xl shadow-2xl border-2 border-purple-500/30"
              />
            </div>
          </motion.div>

          {/* 右侧：自我介绍 */}
          <motion.div
            className="space-y-4 md:space-y-6 order-2 lg:order-2 ml-1 lg:ml-0"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* 标题 */}
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              About Me
            </motion.h2>

            {/* 介绍文字 */}
            <motion.div
              className="space-y-2 md:space-y-3 lg:space-y-4 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                Hey there! I'm a creative soul with a passion for music, art, and storytelling.
                Through DELIX, I explore the cosmic journey of self-discovery and expression.
              </p>

              <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                Each song in this album represents a different chapter of my journey—from
                procrastination and introspection to finding joy in life's simple pleasures.
                Music has always been my way of connecting with the universe and with myself.
              </p>

              <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                When I'm not creating music, you'll find me stargazing, exploring new sounds,
                or sharing salmon and potatoes with friends. Welcome to my little corner of
                the cosmos! 🌟
              </p>
            </motion.div>

            {/* 装饰性标签 */}
            <motion.div
              className="flex flex-wrap gap-2 md:gap-3 pt-2 md:pt-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              viewport={{ once: true }}
            >
              {['Musician', 'Dreamer', 'Space Explorer'].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-300 text-xs md:text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
        </div>
      </div>
    </section>
  );
}
