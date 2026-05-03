// app/home/page.tsx

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import styles from "./page.module.css";
import SayingPage from "../saying/page";

export default function HomePage() {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [orbitOpacity, setOrbitOpacity] = useState(0);
  const [moveToCorner, setMoveToCorner] = useState(false);
  const [showHero, setShowHero] = useState(false);
  const [showCurtain, setShowCurtain] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

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
    if (width <= 360) return { radius: 45, nameFontSize: 13, charFontSize: 4.5, smallCharFontSize: 3.5 };
    if (width <= 480) return { radius: 55, nameFontSize: 14, charFontSize: 5, smallCharFontSize: 4 };
    if (width <= 768) return { radius: 65, nameFontSize: 16, charFontSize: 5.5, smallCharFontSize: 4.5 };
    if (width <= 1024) return { radius: 80, nameFontSize: 18, charFontSize: 6, smallCharFontSize: 5 };
    if (width >= 2560) return { radius: 120, nameFontSize: 24, charFontSize: 8, smallCharFontSize: 6 };
    return { radius: 95, nameFontSize: 20, charFontSize: 7, smallCharFontSize: 5.5 };
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
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
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
    <>
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
      <SayingPage />
    </>
  );
}