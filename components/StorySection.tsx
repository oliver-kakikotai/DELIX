'use client';

import { useState, useRef, useEffect } from 'react';

interface StoryItem {
  chapter: string;
  title: string;
  content: string;
  image: string;
}

// 简单的打字机效果组件
function TypewriterText({
  text,
  delay = 0,
  speed = 50
}: {
  text: string;
  delay?: number;
  speed?: number;
}) {
  const [displayText, setDisplayText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // 初始延迟
    const delayTimer = setTimeout(() => {
      setStarted(true);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.substring(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [started, text, speed]);

  return <>{displayText}</>;
}

export default function StorySection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offset, setOffset] = useState(0); // 过渡进度 0-100
  const sectionRef = useRef<HTMLDivElement>(null);
  const accumulatedDelta = useRef(0);
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 检测是否为移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || ('ontouchstart' in window));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 监听组件进入视口
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowTypewriter(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stories: StoryItem[] = [
    {
      chapter: "Chapter 01",
      title: "The Beginning",
      content: "It all started with a simple melody that echoed through the cosmos. A sound that would become the foundation of DELIX, a journey through space and self-discovery.",
      image: "/images/IMG_0485.PNG"
    },
    {
      chapter: "Chapter 02",
      title: "Finding My Voice",
      content: "Through countless nights of experimentation and exploration, I discovered that music wasn't just about sound—it was about emotion and connection.",
      image: "/images/IMG_0487.PNG"
    },
    {
      chapter: "Chapter 03",
      title: "The Cosmic Journey",
      content: "Each planet in this album represents a different aspect of the human experience. From procrastination to introspection, from loneliness to joy.",
      image: "/images/IMG_0503.PNG"
    },
    {
      chapter: "Chapter 04",
      title: "Tomorrow's Promise",
      content: "The first song, 'Tomorrow,' captures that feeling we all know—the promise to ourselves that tomorrow will be different.",
      image: "/images/IMG_0505.JPG"
    }
  ];

  // 桌面端滚动监听
  useEffect(() => {
    // 检测是否为触摸设备
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // 移动端不使用 wheel 事件
    if (isTouchDevice) return;

    const handleWheel = (e: WheelEvent) => {
      const section = sectionRef.current;
      if (!section) return;

      // 检查是否在sticky状态
      const rect = section.getBoundingClientRect();
      const isSticky = rect.top <= 0 && rect.bottom >= window.innerHeight;

      if (!isSticky) return;

      const scrollingDown = e.deltaY > 0;
      const scrollingUp = e.deltaY < 0;

      // 边界条件：允许正常滚动
      if ((currentIndex === 0 && scrollingUp) || (currentIndex === stories.length - 1 && scrollingDown)) {
        accumulatedDelta.current = 0;
        setOffset(0);
        return;
      }

      // 只在可以切换章节时才阻止默认滚动
      if ((scrollingDown && currentIndex < stories.length - 1) || (scrollingUp && currentIndex > 0)) {
        e.preventDefault();

        // 累积滚动量
        accumulatedDelta.current += e.deltaY;

        // 计算进度 (800px = 100%)
        const threshold = 800;
        const progress = Math.min(Math.abs(accumulatedDelta.current) / threshold * 100, 100);

        setOffset(progress);

        // 完成切换
        if (progress >= 100) {
          if (scrollingDown) {
            setCurrentIndex(prev => prev + 1);
          } else {
            setCurrentIndex(prev => prev - 1);
          }
          accumulatedDelta.current = 0;
          setOffset(0);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentIndex, stories.length]);

  // 移动端触摸滑动监听 - 只在 sticky 状态下触发
  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) return;

    const section = sectionRef.current;
    if (!section) return;

    let touchStartY = 0;
    let touchStartTime = 0;
    let isStickyMode = false;

    const handleTouchStart = (e: TouchEvent) => {
      const rect = section.getBoundingClientRect();
      // 检查是否在 sticky 状态
      isStickyMode = rect.top <= 0 && rect.bottom >= window.innerHeight;

      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // 只在 sticky 模式下处理章节切换
      if (!isStickyMode) return;

      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      const deltaY = touchStartY - touchEndY;
      const deltaTime = touchEndTime - touchStartTime;

      // 快速滑动（小于300ms）且滑动距离大于80px
      if (deltaTime < 300 && Math.abs(deltaY) > 80) {
        if (deltaY > 0 && currentIndex < stories.length - 1) {
          // 向上滑动，显示下一章
          setCurrentIndex(prev => prev + 1);
          setOffset(0);
        } else if (deltaY < 0 && currentIndex > 0) {
          // 向下滑动，显示上一章
          setCurrentIndex(prev => prev - 1);
          setOffset(0);
        }
      }
    };

    section.addEventListener('touchstart', handleTouchStart, { passive: true });
    section.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      section.removeEventListener('touchstart', handleTouchStart);
      section.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, stories.length]);

  // 判断滚动方向
  const isScrollingDown = accumulatedDelta.current > 0;
  const isScrollingUp = accumulatedDelta.current < 0;

  // 每个章节的边框颜色
  const borderColors = ['#00ff00', '#ff00ff', '#00ffff', '#ffff00'];
  const currentBorderColor = borderColors[currentIndex];

  // 获取各章节数据
  const currentStory = stories[currentIndex] || stories[0];
  const nextStory = currentIndex < stories.length - 1 ? stories[currentIndex + 1] : currentStory;
  const prevStory = currentIndex > 0 ? stories[currentIndex - 1] : currentStory;

  // 渲染单个章节
  const renderChapter = (
    story: StoryItem,
    translateY: number,
    zIndex: number
  ) => {
    if (!story) return null;

    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: `translateY(${translateY}%)`,
          zIndex: zIndex
        }}
      >
        {/* 背景图片 */}
        <img
          src={story.image}
          alt={story.title}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* 遮罩 */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }} />

        {/* 内容 */}
        <div style={{
          position: 'absolute',
          bottom: '5rem',
          right: '3rem',
          maxWidth: '40rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          color: 'white',
          textAlign: 'left'
        }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            opacity: 0.8,
            letterSpacing: '0.1em',
            color: '#c084fc',
            fontFamily: 'monospace'
          }}>
            {showTypewriter ? <TypewriterText text={story.chapter} delay={0} speed={5} /> : story.chapter}
          </div>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 900,
            marginBottom: '1.5rem',
            background: 'linear-gradient(to right, #c084fc, #f472b6, #60a5fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'monospace'
          }}>
            {showTypewriter ? <TypewriterText text={story.title} delay={100} speed={10} /> : story.title}
          </h2>
          <p style={{
            fontSize: 'clamp(0.9rem, 1.5vw, 1.25rem)',
            lineHeight: 1.6,
            color: '#e5e7eb',
            fontFamily: 'monospace'
          }}>
            {showTypewriter ? <TypewriterText text={story.content} delay={300} speed={10} /> : story.content}
          </p>
        </div>
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? '100vh' : '400vh', // 移动端只占一屏，桌面端4屏
        minHeight: '100vh',
        backgroundColor: '#000'
      }}
    >
      {/* Sticky 固定容器 */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: '#000',
          border: `5px solid ${currentBorderColor}`,
          transition: 'border-color 0.3s ease'
        }}
      >
        {/* 相对定位容器 */}
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>

          {/* 当前章节 - 固定不动 */}
          {renderChapter(currentStory, 0, 1)}

          {/* 下一章 - 向下滚动时，从下方滑上来盖住当前章节 */}
          {isScrollingDown && currentIndex < stories.length - 1 &&
            renderChapter(nextStory, 100 - offset, 2)}

          {/* 上一章 - 向上滚动时，从上方滑下来盖住当前章节 */}
          {isScrollingUp && currentIndex > 0 &&
            renderChapter(prevStory, offset - 100, 2)}
        </div>

        {/* 章节指示点 */}
        <div
          style={{
            position: 'absolute',
            bottom: isMobile ? '1.5rem' : '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: isMobile ? '0.75rem' : '0.5rem',
            alignItems: 'center',
            zIndex: 20,
            padding: isMobile ? '1.25rem 1.5rem' : '1rem',
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '9999px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {stories.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                console.log('Chapter button clicked:', index);
                setCurrentIndex(index);
                setOffset(0);
                accumulatedDelta.current = 0;
              }}
              style={{
                width: index === currentIndex
                  ? (isMobile ? '3rem' : '2.5rem')
                  : (isMobile ? '1.25rem' : '1rem'),
                height: isMobile ? '1.25rem' : '1rem',
                backgroundColor: index === currentIndex ? '#a855f7' : 'rgba(255, 255, 255, 0.5)',
                border: 'none',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                touchAction: 'manipulation' // 确保按钮可点击
              }}
              aria-label={`Go to chapter ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
