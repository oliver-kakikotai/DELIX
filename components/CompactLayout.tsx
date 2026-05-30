'use client';

import { useState } from 'react';
import MainContentCard from './MainContentCard';
import CharacterCard from './CharacterCard';
import FloatingButtons from './RotatingPlanet';
import FeaturedProjects from './FeaturedProjects';
import CubeFlipSection from './CubeFlipSection';
import SpaceInteractionSection from './SpaceInteractionSection';
import ConsultationSection from './ConsultationSection';
import Footer from './Footer';

function CompactLayout() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handlePlayVideo = () => {
    setIsVideoPlaying(!isVideoPlaying);
    console.log('播放角色介绍视频');
  };

  const handleExploreClick = () => {
    document.getElementById('character')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const handleViewWorksClick = () => {
    document.getElementById('gallery')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <>
      {/* 现有的主要内容区域 */}
      <main className="relative z-10 px-2.5 py-2.5 w-full">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 min-h-[calc(100vh-180px)] w-full">
            
            {/* Left Main Card - 兔子介绍 */}
            <div className="lg:col-span-7">
              <MainContentCard 
                onExploreClick={handleExploreClick}
                onViewWorksClick={handleViewWorksClick}
              />
            </div>

            {/* Right Column - Character Card and Rotating Planet */}
            <div className="lg:col-span-5 flex flex-col gap-2.5 h-full">
              {/* Character Card - 占据上半部分 */}
              <div className="flex-1 min-h-[200pxni]">
                <CharacterCard />
              </div>
              
              {/* Rotating Planet - 占据下半部分 */}
              <div className="flex-1 min-h-[200px]">z
                <FloatingButtons />
              </div>
            </div>
            
          </div>
          
          {/* Featured Projects Section */}
          <FeaturedProjects />
          
          {/* Cube Flip Section */}
          <CubeFlipSection />
          
          {/* 纯白色曲线流星系统 */}
          <div className="mt-2.5">
            <SpaceInteractionSection />
          </div>
          
        </div>
      </main>
      
      {/* 咨询联系区域 */}
      <section id="consultation">
        <ConsultationSection />
      </section>

      {/* 页脚 */}
      <Footer />
    </>
  );
}

export default CompactLayout;
