// app/saying/page.tsx

"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import styles from "./page.module.css";
import ResumeGlitchScene from "../components/ResumeGlitchScene";

export default function SayingPage() {
  const [isActive, setIsActive] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [textAnimationProgress, setTextAnimationProgress] = useState(1);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const totalScrollDistance = useRef(0);
  const maxScrollDistance = 800;
  const textAnimationRef = useRef(1);
  const scrollDirection = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const pauseTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize and update window size
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsActive(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const updateScrollProgress = useCallback((delta: number) => {
    setScrollProgress((prevProgress) => {
      const newTotal = totalScrollDistance.current + delta;
      const clampedTotal = Math.max(0, Math.min(newTotal, maxScrollDistance));
      totalScrollDistance.current = clampedTotal;

      return clampedTotal / maxScrollDistance;
    });
  }, []);

  useEffect(() => {
    if (!isActive) return;

    let animationFrameId: number;

    const animateText = () => {
      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime.current;

      if (timeSinceLastScroll > 150) {
        if (textAnimationRef.current < 1) {
          textAnimationRef.current = Math.min(
            1,
            textAnimationRef.current + 0.005
          );
          setTextAnimationProgress(textAnimationRef.current);
        }
      } else {
        if (scrollDirection.current > 0) {
          if (textAnimationRef.current < 1) {
            textAnimationRef.current = Math.min(
              1,
              textAnimationRef.current + 0.02
            );
            setTextAnimationProgress(textAnimationRef.current);
          }
        } else if (scrollDirection.current < 0) {
          textAnimationRef.current = Math.max(
            0.4,
            textAnimationRef.current - 0.02
          );
          setTextAnimationProgress(textAnimationRef.current);
        }
      }

      animationFrameId = requestAnimationFrame(animateText);
    };

    animationFrameId = requestAnimationFrame(animateText);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    let animationFrameId: number;
    let pendingDelta = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      scrollDirection.current = e.deltaY;
      lastScrollTime.current = Date.now();

      if (pauseTimeout.current) {
        clearTimeout(pauseTimeout.current);
      }

      pauseTimeout.current = setTimeout(() => {
        scrollDirection.current = 0;
      }, 150);

      if (Math.abs(e.deltaY) > 0) {
        pendingDelta += e.deltaY;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      (document.body as any).dataset.touchStartY = touch.clientY.toString();
      lastScrollTime.current = Date.now();

      if (pauseTimeout.current) {
        clearTimeout(pauseTimeout.current);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchStartY = parseFloat(
        (document.body as any).dataset.touchStartY || "0"
      );
      const touchCurrentY = e.touches[0].clientY;
      const delta = touchStartY - touchCurrentY;

      if (Math.abs(delta) > 0) {
        e.preventDefault();
        scrollDirection.current = delta;
        lastScrollTime.current = Date.now();

        if (pauseTimeout.current) {
          clearTimeout(pauseTimeout.current);
        }

        pauseTimeout.current = setTimeout(() => {
          scrollDirection.current = 0;
        }, 150);

        pendingDelta += delta * 1.5;
        (document.body as any).dataset.touchStartY =
          touchCurrentY.toString();
      }
    };

    const animateScroll = () => {
      if (Math.abs(pendingDelta) > 0.1) {
        const step = pendingDelta * 0.3;
        updateScrollProgress(step);
        pendingDelta -= step;
      } else if (Math.abs(pendingDelta) > 0) {
        updateScrollProgress(pendingDelta);
        pendingDelta = 0;
      }

      animationFrameId = requestAnimationFrame(animateScroll);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    animationFrameId = requestAnimationFrame(animateScroll);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(animationFrameId);
      if (pauseTimeout.current) {
        clearTimeout(pauseTimeout.current);
      }
    };
  }, [isActive, updateScrollProgress]);

  const getTextStyle = (baseDelay: number) => {
    const progress = textAnimationProgress;
    const lineStart = 0.4 + baseDelay;
    const lineProgress = Math.max(
      0,
      Math.min(1, (progress - lineStart) / (1 - lineStart))
    );

    const opacity = 0.2 + lineProgress * 0.8;
    const translateY = (1 - lineProgress) * 30;
    const blur = (1 - lineProgress) * 6;

    return {
      opacity: opacity,
      transform: `translateY(${translateY}px)`,
      filter: `blur(${blur}px)`,
    };
  };

  return (
    <main
      className={styles.container}
      style={{
        transform: `translateY(${100 - scrollProgress * 100}%)`,
      }}
    >
      <div className={styles.leftContent}>
        <div className={styles.projectsSection}>
          <h1 className={styles.projectsTitle}>Projects that i did</h1>
          <h1 className={styles.projectsTitle}>till today</h1>
        </div>

        <div className={styles.content}>
          <p className={styles.saying}>
            <span className={styles.line1} style={getTextStyle(0)}>
              Prolly your CEO lied too so it&apos;s ok to lie
            </span>
            <span className={styles.line2} style={getTextStyle(0.15)}>
              in your resume but make sure you lie
            </span>
            <span className={styles.line3} style={getTextStyle(0.3)}>
              to enhance your experience, don&apos;t
            </span>
            <span className={styles.line4} style={getTextStyle(0.45)}>
              create one.
            </span>
          </p>
        </div>
      </div>

      <div className={styles.rightContent}>
        <Canvas
          camera={{
            position: [0, 0, 2.4],
            fov: 42,
            near: 0.1,
            far: 10,
          }}
          style={{ background: "transparent" }}
          gl={{
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: false,
            powerPreference: "high-performance",
          }}
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
        >
          <Suspense fallback={null}>
            <color attach="background" args={["#000000"]} />
            <fog attach="fog" args={["#000000", 4, 10]} />

            <ambientLight intensity={0.8} />
            <directionalLight
              position={[3, 4, 4]}
              intensity={1.4}
              castShadow={false}
            />
            <directionalLight
              position={[-4, -2, 3]}
              intensity={0.6}
              castShadow={false}
            />
            <pointLight position={[0, 0, 2.5]} intensity={0.5} />
            <pointLight
              position={[2, -2, 2]}
              intensity={0.3}
              color="#c8d4e8"
            />
            <spotLight
              position={[2, 3, 3]}
              angle={0.4}
              penumbra={1}
              intensity={0.7}
              castShadow={false}
            />

            <ResumeGlitchScene scrollProgress={scrollProgress} />
          </Suspense>
        </Canvas>
      </div>
    </main>
  );
}