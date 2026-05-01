//app/saying/page.tsx

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import styles from "./page.module.css";

export default function SayingPage() {
  const [isActive, setIsActive] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [textAnimationProgress, setTextAnimationProgress] = useState(1);
  const totalScrollDistance = useRef(0);
  const maxScrollDistance = 800; // pixels needed to fully reveal the page
  const textAnimationRef = useRef(1);
  const scrollDirection = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const pauseTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Enable the saying page after all home animations complete
    const timer = setTimeout(() => {
      setIsActive(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const updateScrollProgress = useCallback((delta: number) => {
    setScrollProgress(prevProgress => {
      const newTotal = totalScrollDistance.current + delta;
      // Clamp between 0 and maxScrollDistance
      const clampedTotal = Math.max(0, Math.min(newTotal, maxScrollDistance));
      totalScrollDistance.current = clampedTotal;
      
      // Convert to progress (0 to 1)
      return clampedTotal / maxScrollDistance;
    });
  }, []);

  // Handle text animation based on scrolling
  useEffect(() => {
    if (!isActive) return;

    let animationFrameId: number;

    const animateText = () => {
      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime.current;

      // If no scroll for 150ms, slowly return to full visibility
      if (timeSinceLastScroll > 150) {
        if (textAnimationRef.current < 1) {
          textAnimationRef.current = Math.min(1, textAnimationRef.current + 0.005);
          setTextAnimationProgress(textAnimationRef.current);
        }
      } else {
        // Scroll down (positive delta) - text stays fully visible
        // Scroll up (negative delta) - text starts fading
        if (scrollDirection.current > 0) {
          // Scrolling down - keep text fully visible
          if (textAnimationRef.current < 1) {
            textAnimationRef.current = Math.min(1, textAnimationRef.current + 0.02);
            setTextAnimationProgress(textAnimationRef.current);
          }
        } else if (scrollDirection.current < 0) {
          // Scrolling up - text fades but never below 0.4
          textAnimationRef.current = Math.max(0.4, textAnimationRef.current - 0.02);
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
      
      // Store scroll direction
      scrollDirection.current = e.deltaY;
      lastScrollTime.current = Date.now();
      
      // Clear pause timeout
      if (pauseTimeout.current) {
        clearTimeout(pauseTimeout.current);
      }
      
      // Set pause after 150ms of no scroll
      pauseTimeout.current = setTimeout(() => {
        scrollDirection.current = 0;
      }, 150);
      
      // Accumulate scroll delta with momentum-like behavior
      if (Math.abs(e.deltaY) > 0) {
        pendingDelta += e.deltaY;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Store touch start for calculating delta
      const touch = e.touches[0];
      (document.body).dataset.touchStartY = touch.clientY.toString();
      lastScrollTime.current = Date.now();
      
      // Clear pause timeout
      if (pauseTimeout.current) {
        clearTimeout(pauseTimeout.current);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchStartY = parseFloat(document.body.dataset.touchStartY || '0');
      const touchCurrentY = e.touches[0].clientY;
      const delta = touchStartY - touchCurrentY;

      if (Math.abs(delta) > 0) {
        e.preventDefault();
        scrollDirection.current = delta;
        lastScrollTime.current = Date.now();
        
        // Clear pause timeout
        if (pauseTimeout.current) {
          clearTimeout(pauseTimeout.current);
        }
        
        // Set pause after 150ms of no scroll
        pauseTimeout.current = setTimeout(() => {
          scrollDirection.current = 0;
        }, 150);
        
        pendingDelta += delta * 1.5; // Adjust sensitivity for touch
        document.body.dataset.touchStartY = touchCurrentY.toString();
      }
    };

    // Animation loop for smooth scroll handling
    const animateScroll = () => {
      if (Math.abs(pendingDelta) > 0.1) {
        // Apply scroll with easing
        const step = pendingDelta * 0.3;
        updateScrollProgress(step);
        pendingDelta -= step;
      } else if (Math.abs(pendingDelta) > 0) {
        updateScrollProgress(pendingDelta);
        pendingDelta = 0;
      }
      
      animationFrameId = requestAnimationFrame(animateScroll);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    animationFrameId = requestAnimationFrame(animateScroll);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
      if (pauseTimeout.current) {
        clearTimeout(pauseTimeout.current);
      }
    };
  }, [isActive, updateScrollProgress]);

  // Calculate text animation styles based on progress
  const getTextStyle = (baseDelay: number) => {
    const progress = textAnimationProgress;
    
    // Line 1 (delay 0): visible from progress 0.4 to 1
    // Line 2 (delay 0.15): visible from progress 0.55 to 1
    // Line 3 (delay 0.3): visible from progress 0.7 to 1
    // Line 4 (delay 0.45): visible from progress 0.85 to 1
    
    const lineStart = 0.4 + baseDelay;
    const lineProgress = Math.max(0, Math.min(1, (progress - lineStart) / (1 - lineStart)));
    
    const opacity = 0.2 + (lineProgress * 0.8);
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
        transform: `translateY(${100 - (scrollProgress * 100)}%)`,
      }}
    >
      <div className={styles.projectsSection}>
        <h1 className={styles.projectsTitle}>Projects that i did</h1>
        <h1 className={styles.projectsTitle}>till today</h1>
      </div>

      <div className={styles.content}>
        <p className={styles.saying}>
          <span className={styles.line1} style={getTextStyle(0)}>
            Prolly your CEO lied too so it's ok to lie
          </span>
          <span className={styles.line2} style={getTextStyle(0.15)}>
            in your resume but make sure you lie
          </span>
          <span className={styles.line3} style={getTextStyle(0.3)}>
            to enhance your experience, don't
          </span>
          <span className={styles.line4} style={getTextStyle(0.45)}>
            create a fake one.
          </span>
        </p>
      </div>
    </main>
  );
}