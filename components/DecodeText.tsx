'use client';

import { useEffect, useState } from 'react';

interface DecodeTextProps {
  text: string;
  speed?: number; // 解码速度（毫秒）
  className?: string;
}

// 随机字符集
const chars = '!@#$%^&*()_+-=[]{}|;:<>?/~`█▓▒░';

const getRandomChar = () => chars[Math.floor(Math.random() * chars.length)];

export default function DecodeText({ text, speed = 50, className = '' }: DecodeTextProps) {
  const [displayText, setDisplayText] = useState(text); // 默认显示原文，避免hydration错误
  const [isDecoding, setIsDecoding] = useState(false);

  useEffect(() => {
    // 只在客户端开始解码动画
    setIsDecoding(true);

    let frame = 0;
    const totalFrames = text.length;

    const interval = setInterval(() => {
      frame++;

      if (frame > totalFrames) {
        clearInterval(interval);
        setDisplayText(text); // 确保最终显示完整文本
        return;
      }

      // 逐字解码
      const decoded = text
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' '; // 保持空格

          // 如果这个字符应该已经解码了
          if (index < frame) {
            return char;
          }
          // 否则显示随机字符
          return getRandomChar();
        })
        .join('');

      setDisplayText(decoded);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className={className}>{displayText}</span>;
}
