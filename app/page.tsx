// app/page.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles/page.module.css";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
  size: number;
  rotation: number;
}

export default function Home() {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const smoothFrameRef = useRef<number | null>(null);
  const currentDisplayRef = useRef(0);
  const targetPercentageRef = useRef(0);
  const cursorCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0, speed: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const trailRef = useRef<TrailPoint[]>([]);
  const cursorStateRef = useRef<'default' | 'nearCircle' | 'overButton'>('default');
  const magneticRef = useRef({ angle: 0, strength: 0 });
  const cursorAnimationRef = useRef<number | null>(null);
  const mouseOnScreenRef = useRef(false);
  const router = useRouter();
  const duration = 3000;

  // Responsive sizes based on screen width
  const getResponsiveSizes = useCallback(() => {
    const width = windowSize.width;
    if (width <= 320) return { radius: 28, containerSize: 80, offsetDistance: 5, strokeWidth: 2 };
    if (width <= 360) return { radius: 30, containerSize: 85, offsetDistance: 6, strokeWidth: 2 };
    if (width <= 480) return { radius: 34, containerSize: 95, offsetDistance: 7, strokeWidth: 2 };
    if (width <= 768) return { radius: 36, containerSize: 100, offsetDistance: 8, strokeWidth: 2.5 };
    if (width <= 1024) return { radius: 40, containerSize: 110, offsetDistance: 9, strokeWidth: 2.5 };
    if (width >= 2560) return { radius: 64, containerSize: 160, offsetDistance: 13, strokeWidth: 3 };
    return { radius: 46, containerSize: 120, offsetDistance: 10, strokeWidth: 3 };
  }, [windowSize.width]);

  const { radius, containerSize, offsetDistance, strokeWidth } = getResponsiveSizes();
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayPercentage / 100) * circumference;
  const center = containerSize / 2;

  // Initialize and update window size
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Crazy cursor system
  useEffect(() => {
    const cursorCanvas = cursorCanvasRef.current;
    const bgCanvas = bgCanvasRef.current;
    if (!cursorCanvas || !bgCanvas) return;

    const cursorCtx = cursorCanvas.getContext('2d');
    const bgCtx = bgCanvas.getContext('2d');
    if (!cursorCtx || !bgCtx) return;

    const resize = () => {
      cursorCanvas.width = bgCanvas.width = window.innerWidth;
      cursorCanvas.height = bgCanvas.height = window.innerHeight;
    };
    resize();

    // Magnetic field detection
    const getCircleCenter = () => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 - 20 });
    let circleCenter = getCircleCenter();
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseOnScreenRef.current = true;
      const prevX = cursorRef.current.x;
      const prevY = cursorRef.current.y;
      
      cursorRef.current = {
        x: e.clientX,
        y: e.clientY,
        prevX,
        prevY,
        speed: Math.sqrt((e.clientX - prevX) ** 2 + (e.clientY - prevY) ** 2)
      };

      // Magnetic field calculation
      circleCenter = getCircleCenter();
      const dx = e.clientX - circleCenter.x;
      const dy = e.clientY - circleCenter.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 200) {
        magneticRef.current = {
          angle: Math.atan2(dy, dx),
          strength: Math.max(0, 1 - dist / 200)
        };
      } else {
        magneticRef.current = { angle: 0, strength: 0 };
      }

      // Particle emission based on speed
      if (cursorRef.current.speed > 5) {
        const particleCount = Math.floor(cursorRef.current.speed / 3);
        for (let i = 0; i < particleCount; i++) {
          particlesRef.current.push({
            x: e.clientX + (Math.random() - 0.5) * 10,
            y: e.clientY + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * cursorRef.current.speed * 0.5,
            vy: (Math.random() - 0.5) * cursorRef.current.speed * 0.5 - Math.random() * 2,
            life: 1,
            maxLife: 0.5 + Math.random() * 0.5,
            size: Math.random() * 3 + 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2
          });
        }
      }

      // Organic trail
      trailRef.current.push({
        x: e.clientX,
        y: e.clientY,
        alpha: 0.6,
        size: Math.min(4, cursorRef.current.speed * 0.2 + 2),
        rotation: Date.now() * 0.001
      });

      if (trailRef.current.length > 40) {
        trailRef.current.shift();
      }
    };

    const handleMouseLeave = () => {
      mouseOnScreenRef.current = false;
      cursorRef.current.speed = 0;
      trailRef.current = [];
      particlesRef.current = [];
      magneticRef.current = { angle: 0, strength: 0 };
    };

    const handleMouseEnter = (e: MouseEvent) => {
      mouseOnScreenRef.current = true;
      cursorRef.current = {
        x: e.clientX,
        y: e.clientY,
        prevX: e.clientX,
        prevY: e.clientY,
        speed: 0
      };
    };

    const animate = () => {
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

      if (!mouseOnScreenRef.current) {
        cursorAnimationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Draw magnetic field glow
      if (magneticRef.current.strength > 0) {
        const gradient = bgCtx.createRadialGradient(
          circleCenter.x, circleCenter.y, 50,
          circleCenter.x, circleCenter.y, 200
        );
        gradient.addColorStop(0, `rgba(26, 26, 26, ${magneticRef.current.strength * 0.05})`);
        gradient.addColorStop(1, 'rgba(26, 26, 26, 0)');
        bgCtx.fillStyle = gradient;
        bgCtx.beginPath();
        bgCtx.arc(circleCenter.x, circleCenter.y, 200, 0, Math.PI * 2);
        bgCtx.fill();
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.life -= 0.02;
        if (particle.life <= 0) return false;

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.05;
        particle.vx *= 0.99;
        particle.rotation += particle.rotationSpeed;

        bgCtx.save();
        bgCtx.translate(particle.x, particle.y);
        bgCtx.rotate(particle.rotation);
        bgCtx.fillStyle = `rgba(26, 26, 26, ${particle.life * 0.3})`;
        bgCtx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        bgCtx.restore();

        return true;
      });

      // Draw organic trail with ribbons
      if (trailRef.current.length > 1) {
        for (let i = 1; i < trailRef.current.length; i++) {
          const point = trailRef.current[i];
          const prevPoint = trailRef.current[i - 1];
          
          point.alpha *= 0.94;
          point.size *= 0.98;

          if (point.alpha > 0.01) {
            cursorCtx.beginPath();
            cursorCtx.moveTo(prevPoint.x, prevPoint.y);
            cursorCtx.lineTo(point.x, point.y);
            cursorCtx.strokeStyle = `rgba(26, 26, 26, ${point.alpha * 0.4})`;
            cursorCtx.lineWidth = point.size;
            cursorCtx.lineCap = 'round';
            cursorCtx.stroke();

            cursorCtx.beginPath();
            cursorCtx.moveTo(prevPoint.x, prevPoint.y);
            cursorCtx.lineTo(point.x, point.y);
            cursorCtx.strokeStyle = `rgba(26, 26, 26, ${point.alpha * 0.15})`;
            cursorCtx.lineWidth = point.size * 3;
            cursorCtx.stroke();
          }
        }
      }

      // Main cursor - geometric diamond
      const { x, y } = cursorRef.current;
      const magneticInfluence = magneticRef.current.strength;
      
      cursorCtx.save();
      cursorCtx.translate(x, y);
      
      if (magneticInfluence > 0) {
        cursorCtx.rotate(magneticRef.current.angle + Math.PI / 4);
      }

      cursorCtx.beginPath();
      const size = 8 + magneticInfluence * 4;
      cursorCtx.moveTo(0, -size);
      cursorCtx.lineTo(size, 0);
      cursorCtx.lineTo(0, size);
      cursorCtx.lineTo(-size, 0);
      cursorCtx.closePath();
      cursorCtx.fillStyle = 'rgba(26, 26, 26, 0.9)';
      cursorCtx.fill();
      cursorCtx.strokeStyle = 'rgba(250, 250, 248, 0.5)';
      cursorCtx.lineWidth = 1;
      cursorCtx.stroke();

      cursorCtx.beginPath();
      cursorCtx.arc(0, 0, 2, 0, Math.PI * 2);
      cursorCtx.fillStyle = '#fafaf8';
      cursorCtx.fill();

      const ringRotation = Date.now() * 0.002;
      cursorCtx.beginPath();
      cursorCtx.arc(0, 0, size + 6, ringRotation, ringRotation + Math.PI * 1.5);
      cursorCtx.strokeStyle = 'rgba(26, 26, 26, 0.4)';
      cursorCtx.lineWidth = 1.5;
      cursorCtx.stroke();

      cursorCtx.beginPath();
      cursorCtx.arc(0, 0, size + 10, -ringRotation, -ringRotation + Math.PI * 1.2);
      cursorCtx.strokeStyle = 'rgba(26, 26, 26, 0.2)';
      cursorCtx.lineWidth = 1;
      cursorCtx.stroke();

      cursorCtx.restore();

      trailRef.current = trailRef.current.filter(point => point.alpha > 0.01);

      cursorAnimationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('resize', resize);
      if (cursorAnimationRef.current) {
        cancelAnimationFrame(cursorAnimationRef.current);
      }
    };
  }, []);

  const updateDisplay = useCallback(() => {
    const target = targetPercentageRef.current;
    const current = currentDisplayRef.current;
    
    if (Math.abs(current - target) < 0.05) {
      currentDisplayRef.current = target;
      setDisplayPercentage(Math.round(target));
      if (target === 100) {
        return;
      }
    } else {
      const newValue = current + (target - current) * 0.3;
      currentDisplayRef.current = newValue;
      setDisplayPercentage(Math.round(newValue));
    }
    
    smoothFrameRef.current = requestAnimationFrame(updateDisplay);
  }, []);

  const animate2 = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      targetPercentageRef.current = progress * 100;

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate2);
      } else {
        targetPercentageRef.current = 100;
        setIsRunning(false);
      }
    },
    []
  );

  const startAnimation = useCallback(() => {
    setDisplayPercentage(0);
    currentDisplayRef.current = 0;
    targetPercentageRef.current = 0;
    startTimeRef.current = null;
    setIsRunning(true);
    
    if (smoothFrameRef.current) cancelAnimationFrame(smoothFrameRef.current);
    smoothFrameRef.current = requestAnimationFrame(updateDisplay);
  }, [updateDisplay]);

  useEffect(() => {
    startAnimation();
    
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (smoothFrameRef.current) cancelAnimationFrame(smoothFrameRef.current);
    };
  }, [startAnimation]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startAnimation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [startAnimation]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        startAnimation();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [startAnimation]);

  useEffect(() => {
    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(animate2);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRunning, animate2]);

  const getCounterPosition = () => {
    const angle = (displayPercentage / 100) * 360 - 90;
    const radian = (angle * Math.PI) / 180;
    const distanceFromCenter = radius + offsetDistance;
    
    const x = center + distanceFromCenter * Math.cos(radian);
    const y = center + distanceFromCenter * Math.sin(radian);
    
    return {
      left: `${x}px`,
      top: `${y}px`,
      transform: "translate(-50%, -50%)"
    };
  };

  const handleStartClick = () => {
    router.push("/home");
  };

  return (
    <main className={styles.container}>
      <canvas ref={bgCanvasRef} className={styles.backgroundParticles} />
      <canvas ref={cursorCanvasRef} className={styles.cursorCanvas} />
      
      <div className={styles.circleWrapper}>
        <div className={styles.circleContainer}>
          {/* Background track */}
          <svg 
            width={containerSize} 
            height={containerSize} 
            className={styles.svg}
            viewBox={`0 0 ${containerSize} ${containerSize}`}
          >
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#e8e8e0"
              strokeWidth={strokeWidth}
            />
          </svg>

          {/* Progress circle */}
          <svg 
            width={containerSize} 
            height={containerSize} 
            className={styles.svg}
            viewBox={`0 0 ${containerSize} ${containerSize}`}
          >
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#2a2a2a"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${center} ${center})`}
            />
          </svg>

          {/* Counter */}
          <div 
            className={styles.counterText}
            style={getCounterPosition()}
          >
            {displayPercentage}
          </div>

          {/* Center text */}
          <div className={styles.centerText}>SITAL</div>
        </div>

        <button className={styles.startButton} onClick={handleStartClick}>
          Start
        </button>
      </div>
    </main>
  );
}