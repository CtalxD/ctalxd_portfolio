"use client";

import { useEffect, useState, useMemo } from "react";
import styles from "./page.module.css";

export default function HomePage() {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [orbitOpacity, setOrbitOpacity] = useState(0);
  const [moveToCorner, setMoveToCorner] = useState(false);
  const [showHero, setShowHero] = useState(false);

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
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
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
  const radius = 95;
  const characters = text.split("");

  const characterPositions = useMemo(() => {
    const total = characters.length;
    const angleStep = 360 / total;

    // ✅ center the full sentence properly on the circle
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
  }, [characters]);

  return (
    <main className={styles.container}>
      <div className={`${styles.animationContainer} ${moveToCorner ? styles.moveToTopLeft : ''}`}>
        <div className={styles.centerContent}>
          <div className={`${styles.orbitWrapper} ${moveToCorner ? styles.orbitSmall : ''}`}>
            {animationPhase >= 2 && (
              <div 
                className={styles.orbitInner} 
                style={{ 
                  opacity: orbitOpacity,
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                {characters.map((char, index) => (
                  <span
                    key={index}
                    className={`${styles.orbitChar} ${moveToCorner ? styles.orbitCharSmall : ''}`}
                    style={{
                      left: `${moveToCorner ? characterPositions[index].x * 0.6 : characterPositions[index].x}px`,
                      top: `${moveToCorner ? characterPositions[index].y * 0.6 : characterPositions[index].y}px`,
                      transform: `translate(-50%, -50%) rotate(${characterPositions[index].baseAngle + 90}deg)`,
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </div>
            )}
            <h1 className={`${styles.name} ${animationPhase >= 1 ? styles.visible : ''} ${moveToCorner ? styles.nameSmall : ''}`}>
              Sital
            </h1>
          </div>
        </div>
      </div>

      <div className={`${styles.heroSection} ${showHero ? styles.heroVisible : ''}`}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroName}>
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
          <div className={styles.heroDivider}></div>
          <p className={styles.heroTitle}>
            <span className={styles.heroTitleWord}>UI/UX</span>
            <span className={styles.heroTitleWord}>&nbsp;ENGINEER</span>
          </p>
        </div>
      </div>
    </main>
  );
}