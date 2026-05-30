'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import MeteorParticles from './MeteorParticles';

function SpaceInteractionSection() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);
  const imagePlanetsRef = useRef<THREE.Mesh[]>([]);

  // 星空飞入效果状态
  const [isVisible, setIsVisible] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // 确保组件已在客户端挂载
  useEffect(() => {
    setMounted(true);
  }, []);

  // 滚动进度追踪
  const containerRef = useRef<HTMLDivElement>(null);

  // 检测组件是否进入视口 - 添加星空飞入效果
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log('SpaceInteractionSection 可见性:', entry.isIntersecting, '动画已开始:', animationStarted);
        if (entry.isIntersecting && !animationStarted) {
          console.log('开始流星动画');
          setAnimationStarted(true);
          // 立即开始动画，让用户能看到
          setTimeout(() => {
            setIsVisible(true);
          }, 500); // 增加延迟时间
        }
      },
      { 
        threshold: 0.05, // 降低阈值，更容易触发
        rootMargin: '50px' // 提前50px触发
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [animationStarted]);

  // 共享几何体和材质（记忆化）
  const sharedGeometries = useMemo(() => ({
    asteroid: new THREE.DodecahedronGeometry(1, 0),
    star: new THREE.BufferGeometry(),
    imagePlanet: new THREE.SphereGeometry(8, 32, 32), // 图片星球
  }), []);

  const sharedMaterials = useMemo(() => {
    return {
      asteroid: new THREE.MeshPhongMaterial({ 
        color: 0x666666,
        shininess: 30
      }),
      star: new THREE.PointsMaterial({ color: 0xffffff, size: 1 }),
      imagePlanets: [
        new THREE.MeshPhongMaterial({ 
          color: 0x8b5cf6, 
          shininess: 100,
          transparent: true,
          opacity: 0.8,
          emissive: 0x4c1d95
        }),
        new THREE.MeshPhongMaterial({ 
          color: 0x3b82f6, 
          shininess: 100,
          transparent: true,
          opacity: 0.8,
          emissive: 0x1e40af
        }),
        new THREE.MeshPhongMaterial({ 
          color: 0xf97316, 
          shininess: 100,
          transparent: true,
          opacity: 0.8,
          emissive: 0xc2410c
        })
      ]
    };
  }, []);

  // 初始化Three.js场景
  useEffect(() => {
    if (!mountRef.current || !mounted) return;

    // 场景设置
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: false,
      alpha: true,
      powerPreference: "high-performance"
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 相机位置
    camera.position.z = 10;

    // 创建星空背景
    const starCount = 800;
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 300;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 300;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 300;
      starSizes[i] = Math.random() * 2 + 0.5;
    }
    
    sharedGeometries.star.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    sharedGeometries.star.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    
    sharedMaterials.star.sizeAttenuation = false;
    sharedMaterials.star.vertexColors = false;
    
    const stars = new THREE.Points(sharedGeometries.star, sharedMaterials.star);
    scene.add(stars);

    // 创建小行星
    const asteroidPositions = [
      { x: -50, y: 10, z: -30 },
      { x: 50, y: -10, z: -30 },
      { x: 0, y: 50, z: -30 }
    ];

    asteroidPositions.forEach((pos, index) => {
      const asteroid = new THREE.Mesh(sharedGeometries.asteroid, sharedMaterials.asteroid);
      asteroid.position.set(pos.x, pos.y, pos.z);
      scene.add(asteroid);
    });

    // 创建图片对应的星球（从远处开始）
    const imagePlanets: THREE.Mesh[] = [];
    const planetPositions = [
      { x: -30, y: 15, z: -200 }, // Z字左上，从远处开始
      { x: 0, y: 0, z: -200 },    // Z字中心，从远处开始  
      { x: 30, y: -15, z: -200 }  // Z字右下，从远处开始
    ];

    planetPositions.forEach((pos, index) => {
      const planet = new THREE.Mesh(sharedGeometries.imagePlanet, sharedMaterials.imagePlanets[index]);
      planet.position.set(pos.x, pos.y, pos.z);
      planet.visible = false; // 初始状态隐藏
      scene.add(planet);
      imagePlanets.push(planet);
    });

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // 保存引用
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    imagePlanetsRef.current = imagePlanets;

    // 窗口大小调整
    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // 可见性API优化
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      Object.values(sharedGeometries).forEach(geometry => geometry.dispose());
      Object.values(sharedMaterials).forEach(material => {
        if (Array.isArray(material)) {
          material.forEach(m => m.dispose());
        } else {
          material.dispose();
        }
      });
    };
  }, [sharedGeometries, sharedMaterials, mounted]);

  // 根据滚动进度更新星球位置
  const updatePlanetPositions = useCallback((progress: number) => {
    if (!imagePlanetsRef.current || imagePlanetsRef.current.length === 0) return;

    console.log('滚动进度:', progress); // 调试日志

    // 将滚动进度分为三个阶段，每个阶段约占33%
    const totalStages = 3;
    const stageProgress = progress * totalStages; // 0-3 的进度

    imagePlanetsRef.current.forEach((planet, index) => {
      const stageStart = index * 0.8; // 每个阶段开始时间
      const stageEnd = stageStart + 1.2; // 每个阶段结束时间，有重叠
      
      if (stageProgress >= stageStart && stageProgress <= stageEnd) {
        // 当前阶段的本地进度 (0-1)
        const localProgress = Math.min(1, Math.max(0, (stageProgress - stageStart) / 1.2));
        
        // 从远处 (-200) 飞向近处 (20)
        const startZ = -200;
        const endZ = 20;
        const currentZ = startZ + (endZ - startZ) * localProgress;
        
        planet.position.z = currentZ;
        planet.visible = true;
        
        // 星球随着接近变亮
        const material = planet.material as THREE.MeshPhongMaterial;
        material.opacity = 0.3 + localProgress * 0.7;
        
        console.log(`星球 ${index + 1}: 阶段=${stageProgress.toFixed(2)}, 本地进度=${localProgress.toFixed(2)}, Z=${currentZ.toFixed(1)}`);
        
      } else if (stageProgress > stageEnd) {
        // 已经过了这个阶段，隐藏星球
        planet.visible = false;
        console.log(`星球 ${index + 1}: 已隐藏`);
      } else {
        // 还没到这个阶段，保持在远处且不可见
        planet.position.z = -200;
        planet.visible = false;
        console.log(`星球 ${index + 1}: 等待中`);
      }
    });
  }, []);

  // 渲染循环
  useEffect(() => {
    let lastRenderTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;
    
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastRenderTime;
      
      if (isVisibleRef.current && rendererRef.current && sceneRef.current && cameraRef.current) {
        if (deltaTime >= frameInterval) {
          // 星空动画效果
          const stars = sceneRef.current.children.find(child => child instanceof THREE.Points);
          if (stars) {
            stars.rotation.x += 0.0003;
            stars.rotation.y += 0.0005;
            stars.rotation.z += 0.0001;
            
            const time = Date.now() * 0.0005;
            stars.scale.setScalar(1 + Math.sin(time) * 0.05);
          }
          
          // 小行星动画
          sceneRef.current.children.forEach((child, childIndex) => {
            if (child instanceof THREE.Mesh && child.geometry instanceof THREE.DodecahedronGeometry) {
              child.rotation.x += 0.01;
              child.rotation.y += 0.015;
              child.rotation.z += 0.005;
              
              const floatTime = Date.now() * 0.001 + childIndex;
              const originalY = [-50, 50, 0][childIndex % 3] || 0;
              child.position.y = originalY + Math.sin(floatTime) * 2;
            }
          });

          // 图片星球动画（基础旋转）
          imagePlanetsRef.current.forEach((planet, index) => {
            if (planet.visible) {
              planet.rotation.y += 0.008;
              planet.rotation.x += 0.003;
              
              // 添加轻微的脉动效果
              const pulseTime = Date.now() * 0.002 + index * 0.5;
              const pulseScale = 1 + Math.sin(pulseTime) * 0.05;
              planet.scale.setScalar(pulseScale);
            }
          });
          
          rendererRef.current.render(sceneRef.current, cameraRef.current);
          lastRenderTime = currentTime;
        }
      }
      
      animationIdRef.current = requestAnimationFrame(animate);
    };
    
    animationIdRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  // 滚动监听，更新星球位置
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const containerHeight = containerRef.current.offsetHeight;
      
      // 计算组件的可见进度
      const topProgress = Math.max(0, -rect.top / (containerHeight - windowHeight));
      const progress = Math.min(1, topProgress);
      
      console.log('组件位置:', {
        rectTop: rect.top.toFixed(1),
        containerHeight,
        windowHeight,
        progress: progress.toFixed(3)
      });
      
      updatePlanetPositions(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // 初始调用一次
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [updatePlanetPositions]);

  // 图片数据
  const images = [
    { 
      name: 'IMG_0485', 
      title: '神秘星云', 
      description: '探索宇宙深处的神秘星云',
      position: { x: -40, y: 20 }, // Z字左上
      planetColor: '紫色'
    },
    { 
      name: 'IMG_0487', 
      title: '星际旅程', 
      description: '穿越时空的星际探险',
      position: { x: 0, y: 0 }, // Z字中心
      planetColor: '蓝色'
    },
    { 
      name: 'IMG_0503', 
      title: '宇宙奇观', 
      description: '发现未知的宇宙奇观',
      position: { x: 40, y: -20 }, // Z字右下
      planetColor: '橙色'
    }
  ];

  // 为每个图片定义不同的起始位置（从宇宙不同方向飞入）
  const getInitialPosition = (index: number) => {
    // 只在客户端计算位置
    if (!mounted) {
      return { x: 0, y: 0, rotate: 0, scale: 0.01 };
    }
    
    // 安全地获取窗口尺寸
    const screenWidth = window.innerWidth || 1200;
    const screenHeight = window.innerHeight || 800;
    
    const positions = [
      // 第一个从左上角极远处星空飞入
      { x: -screenWidth * 1.5, y: -screenHeight * 1.2, rotate: -120, scale: 0.01 },
      // 第二个从右上角极远处星空飞入  
      { x: screenWidth * 1.5, y: -screenHeight * 1.0, rotate: 120, scale: 0.01 },
      // 第三个从下方极远处飞入
      { x: -screenWidth * 0.8, y: screenHeight * 1.5, rotate: 90, scale: 0.01 }
    ];
    return positions[index] || positions[0];
  };


  // 如果未挂载，显示简单的加载状态
  if (!mounted) {
    return (
      <section 
        className="relative w-full overflow-hidden"
        style={{ height: '180vh', minHeight: '1200px' }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="text-white/60 text-center">
            <div className="text-6xl mb-4">🌟</div>
            <div className="text-xl">宇宙正在加载中...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: '180vh', minHeight: '1200px' }} // 增加高度以容纳更大间距
    >
      <div ref={containerRef} className="relative w-full h-full">
        {/* Three.js 画布 */}
        <div ref={mountRef} className="fixed inset-0 z-10" />
        
        {/* 流星粒子效果层 */}
        <div className="absolute inset-0 z-15">
          <MeteorParticles isActive={isVisible} />
        </div>
        
        {/* 滚动触发的图片内容 */}
        <div className="relative z-20 h-full flex flex-col justify-center items-center space-y-32"> {/* 使用 flexbox 和 space-y-32 确保至少128px间距 */}
        {images.map((image, index) => {
          return (
          <motion.div
            key={image.name}
            className="relative flex items-center justify-center"
            style={{
              minHeight: '400px', // 确保每个内容区域有足够高度
              width: '100%'
            }}
          >
            {/* 图片内容 - 使用简化的出现动画 */}
            <motion.div
              className={`stellar-card-final relative group cursor-pointer ${
                isVisible ? 'card-appear' : 'card-hidden'
              }`}
              style={{
                marginLeft: `${image.position.x * 0.3}vw`,
                marginTop: `${image.position.y * 0.2}vh`,
                animationDelay: `${index * 2000 + 2000}ms`, // 简化延迟
                animationDuration: '1000ms', // 标准卡片出现时间
                animationTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                animationFillMode: 'forwards'
              } as React.CSSProperties}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 10,
                transition: { duration: 0.4 }
              }}
            >
              {/* 图片容器 */}
              <motion.div
                className="relative w-80 h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20"
                whileInView={{
                  boxShadow: [
                    "0 0 0 rgba(255,255,255,0)",
                    "0 0 50px rgba(255,255,255,0.5)",
                    "0 0 100px rgba(123,60,237,0.8)"
                  ],
                  transition: { duration: 1, delay: index * 0.3 + 0.5 }
                }}
              >
                <img
                  src={`/images/${image.name}.PNG`}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                
                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* 内容信息 */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-6 text-white"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ 
                    y: 0, 
                    opacity: 1,
                    transition: { delay: index * 0.3 + 0.8, duration: 0.6 }
                  }}
                >
                  <h3 className="text-2xl font-bold mb-2">{image.title}</h3>
                  <p className="text-white/80 text-sm">{image.description}</p>
                  
                  {/* 进度指示器 */}
                  <motion.div
                    className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden"
                    initial={{ width: 0 }}
                    whileInView={{ 
                      width: "100%",
                      transition: { delay: index * 0.3 + 1, duration: 0.8 }
                    }}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                      initial={{ x: "-100%" }}
                      whileInView={{ 
                        x: "0%",
                        transition: { delay: index * 0.3 + 1.2, duration: 1 }
                      }}
                    />
                  </motion.div>
                </motion.div>

                {/* 装饰性粒子效果 */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileInView={{ 
                    opacity: 1,
                    transition: { delay: index * 0.3 + 0.5, duration: 0.8 }
                  }}
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      style={{
                        left: `${20 + i * 10}%`,
                        top: `${10 + i * 15}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 1, 0.3],
                        scale: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>

              {/* 编号标识 */}
              <motion.div
                className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                initial={{ scale: 0, rotate: 180 }}
                whileInView={{ 
                  scale: 1, 
                  rotate: 0,
                  transition: { delay: index * 0.3 + 1.5, duration: 0.5 }
                }}
              >
                {index + 1}
              </motion.div>
            </motion.div>
          </motion.div>
          );
        })}

        {/* 使用说明 */}
        <motion.div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white/60 z-30 transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
          }`}
        >
          <motion.div 
            className="text-6xl mb-6"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🪐
          </motion.div>
          <div className="text-2xl font-light mb-4">3D宇宙探索器</div>
          <div className="text-lg mb-2">观看流星从远处飞来并变成内容</div>
          <div className="text-sm opacity-60 mb-4">背景中的{images.map(img => img.planetColor).join('、')}星球会依次接近并展现图片</div>
          
          {/* 手动触发按钮 */}
          {!animationStarted && (
            <button
              onClick={() => {
                console.log('手动触发流星动画');
                setAnimationStarted(true);
                setIsVisible(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold text-sm hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105"
            >
              ✨ 开始流星动画
            </button>
          )}
        </motion.div>
        </div>
      </div>
    </section>
  );
}

export default SpaceInteractionSection;
