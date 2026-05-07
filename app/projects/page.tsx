// app/projects/page.tsx

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import styles from "./page.module.css";

interface ProjectsPageProps {
  isActive?: boolean;
}

export default function ProjectsPage({ isActive = false }: ProjectsPageProps) {
  const [contentVisible, setContentVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const projectsScrollingEnabledRef = useRef(false);

  const projects = [
    "RouteMate – Real-Time Bus Tracking App",
    "Restaurant Management System",
    "Real Estate Website",
    "Car Rental System",
    "Salon Booking System",
    "Skill Sikshya / Vrit Technologies",
    "Astrology Website",
    "Music Streaming Platform",
    "Mercedes AMG GT",
  ];

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setContentVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setContentVisible(false);
      setHoveredIndex(null);
      projectsScrollingEnabledRef.current = false;
    }
  }, [isActive]);

  const checkScrollBounds = useCallback(() => {
    if (!sectionRef.current) return;
    
    const rect = sectionRef.current.getBoundingClientRect();
    
    const isFullyInView = rect.top <= 0;
    
    if (isFullyInView && !projectsScrollingEnabledRef.current) {
      projectsScrollingEnabledRef.current = true;
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!isActive || !contentVisible) return;
    checkScrollBounds();
  }, [isActive, contentVisible, checkScrollBounds]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isActive || !contentVisible || !sectionRef.current) return;

    if (!projectsScrollingEnabledRef.current) {
      return;
    }

    const section = sectionRef.current;
    const sectionRect = section.getBoundingClientRect();
    const isAtTop = sectionRect.top >= 0 && sectionRect.top <= 1;
    
    if (e.deltaY < 0) {
      if (isAtTop) {
        projectsScrollingEnabledRef.current = false;
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      window.scrollBy(0, e.deltaY);
    }
    else {
      e.preventDefault();
      e.stopPropagation();
      window.scrollBy(0, e.deltaY);
    }
  }, [isActive, contentVisible]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isActive || !contentVisible) return;
    const touch = e.touches[0];
    (sectionRef.current as any)?.setAttribute('data-touch-y', touch.clientY.toString());
  }, [isActive, contentVisible]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isActive || !contentVisible || !sectionRef.current) return;

    if (!projectsScrollingEnabledRef.current) {
      return;
    }

    const startY = parseFloat((sectionRef.current as any)?.getAttribute('data-touch-y') || '0');
    const currentY = e.touches[0].clientY;
    const delta = startY - currentY;

    const section = sectionRef.current;
    const sectionRect = section.getBoundingClientRect();
    const isAtTop = sectionRect.top >= 0 && sectionRect.top <= 1;

    if (delta < 0) {
      if (isAtTop) {
        projectsScrollingEnabledRef.current = false;
        return;
      }
      e.preventDefault();
      window.scrollBy(0, delta);
    }
    else {
      e.preventDefault();
      window.scrollBy(0, delta);
    }

    (sectionRef.current as any)?.setAttribute('data-touch-y', currentY.toString());
  }, [isActive, contentVisible]);

  useEffect(() => {
    if (!isActive || !sectionRef.current) return;

    const section = sectionRef.current;

    window.addEventListener('scroll', handleScroll, { passive: true });
    section.addEventListener('wheel', handleWheel, { passive: false });
    section.addEventListener('touchstart', handleTouchStart, { passive: false });
    section.addEventListener('touchmove', handleTouchMove, { passive: false });

    checkScrollBounds();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      section.removeEventListener('wheel', handleWheel);
      section.removeEventListener('touchstart', handleTouchStart);
      section.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isActive, handleScroll, handleWheel, handleTouchStart, handleTouchMove, checkScrollBounds]);

  return (
    <section 
      ref={sectionRef} 
      className={`${styles.container} ${isActive ? styles.containerVisible : ''}`}
    >
      <div className={styles.content}>
        <div className={`${styles.header} ${contentVisible ? styles.visible : ""}`}>
          <h2 className={styles.title}>Projects</h2>
          <p className={styles.subtitle}>that i did till today</p>
        </div>

        <div className={styles.projectsLayout}>
          <div className={styles.projectsList}>
            {projects.map((project, index) => (
              <div
                key={index}
                className={`${styles.projectItem} ${
                  contentVisible ? styles.visible : ""
                } ${hoveredIndex === index ? styles.hovered : ""}`}
                style={{ transitionDelay: `${index * 0.08}s` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <h3 className={styles.projectTitle}>{project}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}