'use client';

import { useState } from 'react';

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    // 添加固定定位和更高的 z-index
    <nav className="fixed top-0 left-0 right-0 z-[60] py-3 lg:py-4 px-[5px]">
      {/* Navigation container with 5px padding - 透明背景 */}
      <div className="bg-black/20 backdrop-blur-md rounded-full px-6 lg:px-8 py-3 lg:py-4 shadow-lg border border-white/10 relative overflow-hidden">
        {/* 流星效果 - 使用PNG图片 */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <img
              key={i}
              src="/images/star.png"
              alt="meteor"
              className="absolute"
              style={{
                top: `${30 + i * 20}%`,
                left: '-100px',
                height: '30px',
                width: 'auto',
                animation: `meteor ${8 + i * 2}s linear infinite`,
                animationDelay: `${i * 4}s`,
                transform: 'rotate(-30deg)',
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 12px rgba(255, 255, 255, 0.6))'
              }}
            />
          ))}
        </div>

        <div className="flex justify-between items-center relative z-10">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/images/LOGO.png"
              alt="DELIX"
              className="h-12 lg:h-16 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {/* Navigation Links */}
            <div className="flex space-x-6 lg:space-x-8 text-white font-medium">
              <a
                href="/"
                className="hover:text-purple-400 transition-colors duration-300 hover:scale-105 text-sm lg:text-base"
              >
                Album
              </a>
              <a
                href="#about"
                className="hover:text-purple-400 transition-colors duration-300 hover:scale-105 text-sm lg:text-base"
              >
                About
              </a>
              <a
                href="#contact"
                className="hover:text-purple-400 transition-colors duration-300 hover:scale-105 text-sm lg:text-base"
              >
                Contact
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <div className={`h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
              <div className={`h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
              <div className={`h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-[5px] right-[5px] bg-black/30 backdrop-blur-md rounded-2xl mt-2 p-4 md:hidden shadow-lg border border-white/10 z-40">
          <div className="flex flex-col space-y-3 text-white font-medium">
            <a
              href="/"
              className="hover:text-purple-400 transition-colors py-2 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Album
            </a>
            <a
              href="#about"
              className="hover:text-purple-400 transition-colors py-2 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <a
              href="#contact"
              className="hover:text-purple-400 transition-colors py-2 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;