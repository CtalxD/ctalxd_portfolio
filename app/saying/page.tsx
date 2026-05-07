// app/saying/page.tsx

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import styles from "./page.module.css";

interface SayingPageProps {
  onComplete?: () => void;
  isActive?: boolean;
}

export default function SayingPage({ onComplete, isActive = true }: SayingPageProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [textAnimationProgress, setTextAnimationProgress] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const totalScrollDistance = useRef(0);
  const maxScrollDistance = 800;
  const textAnimationRef = useRef(1);
  const scrollDirection = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const pauseTimeout = useRef<NodeJS.Timeout | null>(null);
  const sayingRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const pendingDeltaRef = useRef(0);

  // Keep the callback ref in sync
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const updateScrollProgress = useCallback((delta: number) => {
    const newTotal = totalScrollDistance.current + delta;
    const clampedTotal = Math.max(0, Math.min(newTotal, maxScrollDistance));
    totalScrollDistance.current = clampedTotal;
    const progress = clampedTotal / maxScrollDistance;
    
    setScrollProgress(progress);
    
    // Only set isComplete once, don't call onComplete here
    if (progress >= 1 && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      isTransitioningRef.current = true;
      setTimeout(() => {
        setIsComplete(true);
        // Allow normal scrolling after transition
        setTimeout(() => {
          isTransitioningRef.current = false;
        }, 300);
      }, 0);
    }
  }, []);

  // Handle the completion callback in an effect to avoid setState during render
  useEffect(() => {
    if (isComplete && onCompleteRef.current) {
      const timer = setTimeout(() => {
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  useEffect(() => {
    if (!isActive) return;

    let animationFrameId: number;

    const animateText = () => {
      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime.current;

      if (timeSinceLastScroll <= 150) {
        // Only update text when actively scrolling
        if (scrollDirection.current > 0) {
          // Scrolling down - make text visible
          if (textAnimationRef.current < 1) {
            textAnimationRef.current = Math.min(
              1,
              textAnimationRef.current + 0.02
            );
            setTextAnimationProgress(textAnimationRef.current);
          }
        } else if (scrollDirection.current < 0) {
          // Scrolling up - only make text blurry after 30% scrolled up
          if (totalScrollDistance.current < maxScrollDistance * 0.7) {
            if (textAnimationRef.current > 0.4) {
              textAnimationRef.current = Math.max(
                0.4,
                textAnimationRef.current - 0.02
              );
              setTextAnimationProgress(textAnimationRef.current);
            }
          }
        }
      }
      // When paused, keep text as is

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

    const handleWheel = (e: WheelEvent) => {
      // Don't prevent default scrolling - let the page scroll naturally
      scrollDirection.current = e.deltaY;
      lastScrollTime.current = Date.now();

      if (pauseTimeout.current) {
        clearTimeout(pauseTimeout.current);
      }

      pauseTimeout.current = setTimeout(() => {
        scrollDirection.current = 0;
      }, 150);

      if (Math.abs(e.deltaY) > 0) {
        pendingDeltaRef.current += e.deltaY;
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
        scrollDirection.current = delta;
        lastScrollTime.current = Date.now();

        if (pauseTimeout.current) {
          clearTimeout(pauseTimeout.current);
        }

        pauseTimeout.current = setTimeout(() => {
          scrollDirection.current = 0;
        }, 150);

        pendingDeltaRef.current += delta * 1.5;
        (document.body as any).dataset.touchStartY =
          touchCurrentY.toString();
      }
    };

    const animateScroll = () => {
      if (Math.abs(pendingDeltaRef.current) > 0.1) {
        const step = pendingDeltaRef.current * 0.3;
        updateScrollProgress(step);
        pendingDeltaRef.current -= step;
      } else if (Math.abs(pendingDeltaRef.current) > 0) {
        updateScrollProgress(pendingDeltaRef.current);
        pendingDeltaRef.current = 0;
      }

      animationFrameId = requestAnimationFrame(animateScroll);
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

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

    const opacity = 0.3 + lineProgress * 0.7;
    const translateY = (1 - lineProgress) * 20;
    const blur = (1 - lineProgress) * 4;

    return {
      opacity: opacity,
      transform: `translateY(${translateY}px)`,
      filter: `blur(${blur}px)`,
    };
  };

  return (
    <div
      ref={sayingRef}
      className={styles.container}
      style={{
        position: 'relative',
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
    </div>
  );
}