// app/home/page.tsx

"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import styles from "./page.module.css";
import SayingPage from "../saying/page";
import ProjectsPage from "../projects/page";

// Type definitions for better type safety
interface WindowSize {
  width: number;
  height: number;
}

interface ResponsiveSizes {
  radius: number;
}

interface CharacterPosition {
  x: number;
  y: number;
  baseAngle: number;
}

interface ScrollState {
  lastScrollY: number;
  ticking: boolean;
}

// Constants for animation timing
const ANIMATION_TIMINGS = {
  PHASE_1_DELAY: 300,
  PHASE_2_DELAY: 2000,
  MOVE_TO_CORNER_DELAY: 5000,
  SHOW_HERO_DELAY: 6500,
  SHOW_CURTAIN_DELAY: 8500,
  ALL_COMPLETE_DELAY: 9500,
  ORBIT_SPEED: 0.6,
  SCROLL_SAYING_THRESHOLD: 50,
  SCROLL_PROJECTS_THRESHOLD: 200,
  SCROLL_LOCK_DURATION: 9000,
} as const;

// Breakpoints for responsive sizing
const BREAKPOINTS = {
  SMALL_PHONE: 360,
  LARGE_PHONE: 480,
  TABLET: 768,
  SMALL_DESKTOP: 1024,
  LARGE_DESKTOP: 2560,
} as const;

// Responsive radius values
const RADIUS_VALUES = {
  SMALL_PHONE: 38,
  LARGE_PHONE: 45,
  TABLET: 55,
  SMALL_DESKTOP: 68,
  LARGE_DESKTOP: 105,
  DEFAULT: 78,
} as const;

// Text constants
const WELCOME_TEXT = "welcome to my portfolio ";
const HERO_NAME = "SITAL ARYAL";
const HERO_TITLE = "UI/UX ENGINEER";

export default function HomePage() {
  const [animationPhase, setAnimationPhase] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [orbitOpacity, setOrbitOpacity] = useState<number>(0);
  const [moveToCorner, setMoveToCorner] = useState<boolean>(false);
  const [showHero, setShowHero] = useState<boolean>(false);
  const [showCurtain, setShowCurtain] = useState<boolean>(false);
  const [windowSize, setWindowSize] = useState<WindowSize>({ width: 0, height: 0 });
  const [showSaying, setShowSaying] = useState<boolean>(false);
  const [showProjects, setShowProjects] = useState<boolean>(false);
  const [allAnimationsComplete, setAllAnimationsComplete] = useState<boolean>(false);
  const [isSayingActive, setIsSayingActive] = useState<boolean>(false);
  const [scrollLocked, setScrollLocked] = useState<boolean>(true);
  
  const mainRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scrollStateRef = useRef<ScrollState>({ lastScrollY: 0, ticking: false });

  // Initialize and update window size with debounced resize handler
  useEffect(() => {
    let resizeTimeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      }, 100); // Debounce resize events
    };
    
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeoutId);
    };
  }, []);

  // Responsive sizes based on screen width with memoized calculation
  const getResponsiveSizes = useCallback((): ResponsiveSizes => {
    const { width } = windowSize;
    
    if (width <= BREAKPOINTS.SMALL_PHONE) return { radius: RADIUS_VALUES.SMALL_PHONE };
    if (width <= BREAKPOINTS.LARGE_PHONE) return { radius: RADIUS_VALUES.LARGE_PHONE };
    if (width <= BREAKPOINTS.TABLET) return { radius: RADIUS_VALUES.TABLET };
    if (width <= BREAKPOINTS.SMALL_DESKTOP) return { radius: RADIUS_VALUES.SMALL_DESKTOP };
    if (width >= BREAKPOINTS.LARGE_DESKTOP) return { radius: RADIUS_VALUES.LARGE_DESKTOP };
    
    return { radius: RADIUS_VALUES.DEFAULT };
  }, [windowSize.width]);

  const { radius } = useMemo(() => getResponsiveSizes(), [getResponsiveSizes]);

  // Lock scrolling for the first 9 seconds
  useEffect(() => {
    const preventScroll = (e: Event) => {
      if (scrollLocked) {
        e.preventDefault();
      }
    };

    const preventWheel = (e: WheelEvent) => {
      if (scrollLocked) {
        e.preventDefault();
      }
    };

    const preventTouchMove = (e: TouchEvent) => {
      if (scrollLocked) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', preventWheel, { passive: false });
    window.addEventListener('touchmove', preventTouchMove, { passive: false });
    window.addEventListener('scroll', preventScroll, { passive: false });
    
    // Unlock scroll after 9 seconds
    const unlockTimer = setTimeout(() => {
      setScrollLocked(false);
    }, ANIMATION_TIMINGS.SCROLL_LOCK_DURATION);

    return () => {
      window.removeEventListener('wheel', preventWheel);
      window.removeEventListener('touchmove', preventTouchMove);
      window.removeEventListener('scroll', preventScroll);
      clearTimeout(unlockTimer);
    };
  }, [scrollLocked]);

  // Main animation sequence timing
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    timers.push(setTimeout(() => {
      setAnimationPhase(1);
    }, ANIMATION_TIMINGS.PHASE_1_DELAY));
    
    timers.push(setTimeout(() => {
      setAnimationPhase(2);
    }, ANIMATION_TIMINGS.PHASE_2_DELAY));

    timers.push(setTimeout(() => {
      setMoveToCorner(true);
    }, ANIMATION_TIMINGS.MOVE_TO_CORNER_DELAY));

    timers.push(setTimeout(() => {
      setShowHero(true);
    }, ANIMATION_TIMINGS.SHOW_HERO_DELAY));

    timers.push(setTimeout(() => {
      setShowCurtain(true);
    }, ANIMATION_TIMINGS.SHOW_CURTAIN_DELAY));

    // Mark all animations as complete
    timers.push(setTimeout(() => {
      setAllAnimationsComplete(true);
    }, ANIMATION_TIMINGS.ALL_COMPLETE_DELAY));
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Orbit rotation animation
  useEffect(() => {
    if (animationPhase !== 2) return;

    setOrbitOpacity(1);
    let angle = 0;

    const animate = () => {
      angle += ANIMATION_TIMINGS.ORBIT_SPEED;
      setRotation(angle);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [animationPhase]);

  // Handle scroll to reveal overlays after all animations complete
  useEffect(() => {
    if (!allAnimationsComplete || scrollLocked) return;

    const scrollState = scrollStateRef.current;
    scrollState.lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (!scrollState.ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Show saying page when scrolling down past threshold
          if (currentScrollY > ANIMATION_TIMINGS.SCROLL_SAYING_THRESHOLD && !showSaying) {
            setShowSaying(true);
          }
          
          // Show projects page when scrolling past threshold
          if (currentScrollY > ANIMATION_TIMINGS.SCROLL_PROJECTS_THRESHOLD && !showProjects) {
            setShowProjects(true);
          }
          
          scrollState.lastScrollY = currentScrollY;
          scrollState.ticking = false;
        });
        scrollState.ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [allAnimationsComplete, showSaying, showProjects, scrollLocked]);

  // Activate SayingPage scroll handling only after all animations complete AND saying page is visible
  useEffect(() => {
    if (allAnimationsComplete && showSaying && !scrollLocked) {
      // Small delay to ensure the component is mounted and animations are fully complete
      const timer = setTimeout(() => {
        setIsSayingActive(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsSayingActive(false);
    }
  }, [allAnimationsComplete, showSaying, scrollLocked]);

  // Memoized character positions calculation
  const characterPositions = useMemo<CharacterPosition[]>(() => {
    const characters = WELCOME_TEXT.split("");
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
  }, [radius]);

  // Memoized class name combinations
  const containerClasses = useMemo(() => {
    return [
      styles.animationContainer,
      moveToCorner ? styles.moveToTopLeft : ''
    ].filter(Boolean).join(' ');
  }, [moveToCorner]);

  const nameClasses = useMemo(() => {
    return [
      styles.name,
      animationPhase >= 1 ? styles.visible : '',
      moveToCorner ? styles.nameSmall : '',
      showCurtain ? styles.nameWhite : ''
    ].filter(Boolean).join(' ');
  }, [animationPhase, moveToCorner, showCurtain]);

  const heroSectionClasses = useMemo(() => {
    return [
      styles.heroSection,
      showHero ? styles.heroVisible : ''
    ].filter(Boolean).join(' ');
  }, [showHero]);

  const heroNameClasses = useMemo(() => {
    return [
      styles.heroName,
      showCurtain ? styles.heroNameWhite : ''
    ].filter(Boolean).join(' ');
  }, [showCurtain]);

  const heroDividerClasses = useMemo(() => {
    return [
      styles.heroDivider,
      showCurtain ? styles.heroDividerWhite : ''
    ].filter(Boolean).join(' ');
  }, [showCurtain]);

  const heroTitleClasses = useMemo(() => {
    return [
      styles.heroTitle,
      showCurtain ? styles.heroTitleDark : ''
    ].filter(Boolean).join(' ');
  }, [showCurtain]);

  const curtainClasses = useMemo(() => {
    return [
      styles.curtain,
      showCurtain ? styles.curtainVisible : ''
    ].filter(Boolean).join(' ');
  }, [showCurtain]);

  // Memoized orbit character class names
  const getOrbitCharClasses = useCallback((index: number): string => {
    return [
      styles.orbitChar,
      moveToCorner ? styles.orbitCharSmall : '',
      showCurtain ? styles.orbitCharWhite : ''
    ].filter(Boolean).join(' ');
  }, [moveToCorner, showCurtain]);

  // Memoized hero name characters
  const heroNameCharacters = useMemo(() => {
    return HERO_NAME.split("").map((char, index) => (
      <span
        key={`${char}-${index}`}
        className={styles.heroNameChar}
        style={{ '--char-index': index } as React.CSSProperties}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  }, []);

  // Memoized hero title words
  const heroTitleWords = useMemo(() => {
    const words = HERO_TITLE.split(" ");
    return words.map((word, index) => (
      <span key={`${word}-${index}`} className={styles.heroTitleWord}>
        {word}{index < words.length - 1 ? '\u00A0' : ''}
      </span>
    ));
  }, []);

  // Memoized orbit characters
  const orbitCharacters = useMemo(() => {
    if (animationPhase < 2) return null;

    const characters = WELCOME_TEXT.split("");
    
    return (
      <div style={{ 
        position: 'relative',
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        transform: `rotate(${rotation}deg)`,
      }}>
        {characters.map((char, index) => (
          <span
            key={index}
            className={getOrbitCharClasses(index)}
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
    );
  }, [animationPhase, radius, rotation, moveToCorner, characterPositions, getOrbitCharClasses]);

  // Memoized spacer height - fixed to prevent extra scroll
  const spacerStyle = useMemo(() => ({
    height: allAnimationsComplete && !scrollLocked ? '100vh' : '100vh',
    transition: 'height 0.3s ease'
  }), [allAnimationsComplete, scrollLocked]);

  // Prevent body scroll when scroll is locked
  useEffect(() => {
    if (scrollLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [scrollLocked]);

  return (
    <div ref={mainRef} className={styles.mainWrapper}>
      <div style={spacerStyle}>
        <main className={styles.container}>
          <div className={curtainClasses}></div>
          <div className={containerClasses}>
            <div className={styles.centerContent}>
              <div className={styles.orbitWrapper}>
                <div className={styles.orbitInner} style={{ opacity: orbitOpacity }}>
                  {orbitCharacters}
                </div>
                <h1 className={nameClasses}>
                  Sital
                </h1>
              </div>
            </div>
          </div>

          <div className={heroSectionClasses}>
            <div className={styles.heroContent}>
              <h1 className={heroNameClasses}>
                {heroNameCharacters}
              </h1>
              <div className={heroDividerClasses}></div>
              <p className={heroTitleClasses}>
                {heroTitleWords}
              </p>
            </div>
          </div>
        </main>
      </div>
      
      <SayingPage isActive={isSayingActive} />
      <ProjectsPage isActive={showProjects} />
    </div>
  );
}