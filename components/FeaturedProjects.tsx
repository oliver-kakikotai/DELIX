'use client';

import { useState } from 'react';

interface Project {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  category: string;
  stats: {
    label: string;
    value: string;
    unit: string;
  }[];
  badge?: string;
}

function FeaturedProjects() {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  // 项目数据 - 模仿参考图片的风格
  const projects: Project[] = [
    {
      id: 'street-art',
      title: 'STREET ART',
      image: '/images/IMG_0485.PNG',
      category: 'Visual Art',
      stats: [
        { label: 'ARTWORKS', value: '150', unit: '' },
        { label: 'EXHIBITIONS', value: '25', unit: '' },
        { label: 'CITIES', value: '8', unit: '' }
      ]
    },
    {
      id: 'character-design',
      title: 'CHARACTER DESIGN',
      image: '/images/IMG_0487.PNG',
      category: 'Character',
      badge: 'READ CASE STUDY',
      stats: [
        { label: 'CHARACTERS', value: '80', unit: '' },
        { label: 'PROJECTS', value: '120', unit: '' },
        { label: 'CLIENTS', value: '12', unit: '' }
      ]
    },
    {
      id: 'digital-art',
      title: 'DIGITAL CREATIONS',
      image: '/images/IMG_0503.PNG',
      category: 'Digital',
      stats: [
        { label: 'TOP RATED', value: '#1', unit: 'IN 10 PLATFORMS' },
        { label: 'DOWNLOADS', value: '2,000', unit: '' },
        { label: 'COLLECTIONS', value: '45', unit: '' }
      ]
    }
  ];

  return (
    <section 
      className="w-full"
      style={{
        padding: '10px 0',
        margin: '0',
        width: '100vw',
        boxSizing: 'border-box'
      }}
    >
      <div 
        className="w-full"
        style={{
          padding: '0 10px',
          margin: '0',
          boxSizing: 'border-box'
        }}
      >
        
        {/* Header Section */}
        <div 
          className="w-full"
          style={{
            marginBottom: '10px'
          }}
        >
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl lg:rounded-2xl text-center text-white shadow-xl"
            style={{
              padding: '20px 10px',
              margin: '0'
            }}
          >
            <h2 className="text-2xl lg:text-4xl font-bold" style={{ marginBottom: '8px' }}>
              FEATURED PROJECTS
            </h2>
            <p className="text-sm lg:text-lg opacity-90" style={{ margin: '0' }}>
              创意作品展示 · CREATIVE SHOWCASE
            </p>
          </div>
        </div>

        {/* Projects Grid */}
        <div 
          className="w-full"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '10px',
            gridGap: '10px',
            margin: '0',
            padding: '0'
          }}
        >
          {projects.map((project) => (
            <div
              key={project.id}
              className="relative overflow-hidden rounded-2xl shadow-xl bg-white cursor-pointer transform transition-all duration-300 hover:scale-102 hover:shadow-2xl"
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
              style={{
                margin: '0',
                padding: '0',
                minHeight: '400px'
              }}
            >
              {/* Project Image - 占据上半部分 */}
              <div 
                className="w-full overflow-hidden"
                style={{ height: '250px' }}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                
                {/* Category Badge */}
                <div 
                  className="absolute bg-black/70 backdrop-blur-sm text-white rounded-full text-xs font-medium"
                  style={{
                    top: '15px',
                    left: '15px',
                    padding: '8px 12px'
                  }}
                >
                  {project.category}
                </div>

                {/* Case Study Badge */}
                {project.badge && (
                  <div 
                    className="absolute bg-yellow-400 text-black rounded-full text-xs font-bold"
                    style={{
                      top: '15px',
                      right: '15px',
                      padding: '8px 12px'
                    }}
                  >
                    {project.badge}
                  </div>
                )}
              </div>

              {/* Content Section - 占据下半部分 */}
              <div 
                className="bg-white w-full"
                style={{
                  padding: '20px',
                  height: '150px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                {/* Title */}
                <h3 
                  className="text-xl lg:text-2xl font-bold text-gray-900"
                  style={{ 
                    margin: '0 0 15px 0',
                    letterSpacing: '1px'
                  }}
                >
                  {project.title}
                </h3>

                {/* Stats Grid */}
                <div 
                  className="w-full"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '15px',
                    gridGap: '15px'
                  }}
                >
                  {project.stats.map((stat, index) => (
                    <div 
                      key={index}
                      className="text-center"
                      style={{ margin: '0' }}
                    >
                      <div 
                        className="text-2xl lg:text-3xl font-bold text-gray-900"
                        style={{ 
                          margin: '0 0 4px 0',
                          lineHeight: '1'
                        }}
                      >
                        {stat.value}
                      </div>
                      <div 
                        className="text-xs lg:text-sm text-gray-600 font-medium"
                        style={{ 
                          margin: '0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {stat.label}
                      </div>
                      {stat.unit && (
                        <div 
                          className="text-xs text-gray-500"
                          style={{ 
                            margin: '2px 0 0 0',
                            fontSize: '10px'
                          }}
                        >
                          {stat.unit}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hover Effect Overlay */}
              {hoveredProject === project.id && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-2xl transition-opacity duration-300 pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div 
          className="text-center"
          style={{
            marginTop: '20px'
          }}
        >
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 lg:px-10 lg:py-4 rounded-full font-semibold text-base lg:text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            查看更多作品 · VIEW MORE PROJECTS
          </button>
        </div>
      </div>
    </section>›
    
  );
}

export default FeaturedProjects;