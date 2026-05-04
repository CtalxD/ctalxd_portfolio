// app/home/page.tsx

"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import styles from "./page.module.css";
import SayingPage from "../saying/page";
import ProjectsPage from "../projects/page";

export default function HomePage() {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [orbitOpacity, setOrbitOpacity] = useState(0);
  const [moveToCorner, setMoveToCorner] = useState(false);
  const [showHero, setShowHero] = useState(false);
  const [showCurtain, setShowCurtain] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showSaying, setShowSaying] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [allAnimationsComplete, setAllAnimationsComplete] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Initialize and update window size
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive sizes based on screen width
  const getResponsiveSizes = useCallback(() => {
    const width = windowSize.width;
    if (width <= 360) return { radius: 38 };
    if (width <= 480) return { radius: 45 };
    if (width <= 768) return { radius: 55 };
    if (width <= 1024) return { radius: 68 };
    if (width >= 2560) return { radius: 105 };
    return { radius: 78 };
  }, [windowSize.width]);

  const { radius } = getResponsiveSizes();

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationPhase(1);
    }, 300);
    
    const timer2 = setTimeout(() => {
      setAnimationPhase(2);
    }, 2000);

    const timer3 = setTimeout(() => {
      setMoveToCorner(true);
    }, 5000);

    const timer4 = setTimeout(() => {
      setShowHero(true);
    }, 6500);

    const timer5 = setTimeout(() => {
      setShowCurtain(true);
    }, 8500);

    // Mark all animations as complete at 9.5 seconds
    const timer6 = setTimeout(() => {
      setAllAnimationsComplete(true);
    }, 9500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, []);

  useEffect(() => {
    if (animationPhase === 2) {
      setOrbitOpacity(1);
      let angle = 0;
      const speed = 0.6;
      let animationId: number;

      const animate = () => {
        angle += speed;
        setRotation(angle);
        animationId = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    }
  }, [animationPhase]);

  // Handle scroll to reveal overlays after all animations complete
  useEffect(() => {
    if (!allAnimationsComplete) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Show saying page when scrolling down past 50px
          if (currentScrollY > 50 && !showSaying) {
            setShowSaying(true);
          }
          
          // Show projects page when scrolling past 200px
          if (currentScrollY > 200 && !showProjects) {
            setShowProjects(true);
          }
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [allAnimationsComplete, showSaying, showProjects]);

  const text = "welcome to my portfolio ";
  const characters = text.split("");

  const characterPositions = useMemo(() => {
    const total = characters.length;
    const angleStep = 360 / total;
    const startAngle = -90 - (angleStep * total) / 2;

    return characters.map((_, index) => {
      const angle = startAngle + index * angleStep;
      const radian = (angle * Math.PI) / 180;

      return {
        x: Math.cos(radian) * radius,
        y: Math.sin(radian) * radius,
        baseAngle: angle,
      };
    });
  }, [characters, radius]);

  const heroNameClasses = [
    styles.heroName,
    showCurtain ? styles.heroNameWhite : ''
  ].filter(Boolean).join(' ');

  const heroDividerClasses = [
    styles.heroDivider,
    showCurtain ? styles.heroDividerWhite : ''
  ].filter(Boolean).join(' ');

  const heroTitleClasses = [
    styles.heroTitle,
    showCurtain ? styles.heroTitleDark : ''
  ].filter(Boolean).join(' ');

  return (
    <div ref={mainRef} className={styles.mainWrapper}>
      {/* Spacer div to enable scrolling after animations complete */}
      <div style={{ height: allAnimationsComplete ? '300vh' : '100vh', transition: 'height 0.3s ease' }}>
        <main className={styles.container}>
          <div className={`${styles.curtain} ${showCurtain ? styles.curtainVisible : ''}`}></div>
          <div className={`${styles.animationContainer} ${moveToCorner ? styles.moveToTopLeft : ''}`}>
            <div className={styles.centerContent}>
              <div className={styles.orbitWrapper}>
                <div className={styles.orbitInner} style={{ opacity: orbitOpacity }}>
                  {animationPhase >= 2 && (
                    <div style={{ 
                      position: 'relative',
                      width: `${radius * 2}px`,
                      height: `${radius * 2}px`,
                      transform: `rotate(${rotation}deg)`,
                    }}>
                      {characters.map((char, index) => (
                        <span
                          key={index}
                          className={`${styles.orbitChar} ${moveToCorner ? styles.orbitCharSmall : ''} ${showCurtain ? styles.orbitCharWhite : ''}`}
                          style={{
                            left: `calc(50% + ${moveToCorner ? characterPositions[index].x * 0.6 : characterPositions[index].x}px)`,
                            top: `calc(50% + ${moveToCorner ? characterPositions[index].y * 0.6 : characterPositions[index].y}px)`,
                            transform: `translate(-50%, -50%) rotate(${characterPositions[index].baseAngle + 90}deg)`,
                          }}
                        >
                          {char === " " ? "\u00A0" : char}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <h1 className={`${styles.name} ${animationPhase >= 1 ? styles.visible : ''} ${moveToCorner ? styles.nameSmall : ''} ${showCurtain ? styles.nameWhite : ''}`}>
                  Sital
                </h1>
              </div>
            </div>
          </div>

          <div className={`${styles.heroSection} ${showHero ? styles.heroVisible : ''}`}>
            <div className={styles.heroContent}>
              <h1 className={heroNameClasses}>
                <span className={styles.heroNameChar} style={{ '--char-index': 0 } as React.CSSProperties}>S</span>
                <span className={styles.heroNameChar} style={{ '--char-index': 1 } as React.CSSProperties}>I</span>
                <span className={styles.heroNameChar} style={{ '--char-index': 2 } as React.CSSProperties}>T</span>
                <span className={styles.heroNameChar} style={{ '--char-index': 3 } as React.CSSProperties}>A</span>
                <span className={styles.heroNameChar} style={{ '--char-index': 4 } as React.CSSProperties}>L</span>
                <span className={styles.heroNameChar} style={{ '--char-index': 5 } as React.CSSProperties}>&nbsp;</span>
                <span className={styles.heroNameChar} style={{ '--char-index': 6 } as React.CSSProperties}>A</span>
                <span className={styles.heroNameChar} style={{ '--char-index': 7 } as React.CSSProperties}>R</span>
                <span className={styles.heroNameChar} style={{ '--char-index': 8 } as React.CSSProperties}>Y</span>
                <span className={styles.heroNameChar} style={{ '--char-index': 9 } as React.CSSProperties}>A</span>
                <span className={styles.heroNameChar} style={{ '--char-index': 10 } as React.CSSProperties}>L</span>
              </h1>
              <div className={heroDividerClasses}></div>
              <p className={heroTitleClasses}>
                <span className={styles.heroTitleWord}>UI/UX</span>
                <span className={styles.heroTitleWord}>&nbsp;ENGINEER</span>
              </p>
            </div>
          </div>
        </main>
      </div>
      
      {/* Fixed overlay layers - only appear when scrolled to */}
      <SayingPage isActive={showSaying} />
      <ProjectsPage isActive={showProjects} />
    </div>
  );
}