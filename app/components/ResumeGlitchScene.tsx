//app/components/ResumeGlitchScene.tsx
"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface ResumeGlitchSceneProps {
  scrollProgress: number;
}

// ─── Noise helper ────────────────────────────────────────────────────────────
function noise3D(x: number, y: number, z: number): number {
  let n = 0;
  const amplitudes  = [1.0, 0.5, 0.25, 0.125];
  const frequencies = [1.0, 2.0, 4.0, 8.0];
  for (let i = 0; i < amplitudes.length; i++) {
    const f = frequencies[i], a = amplitudes[i];
    n += a * (
      Math.sin(x * f * 3.7 + y * f * 4.3 + z * f * 2.1) *
      Math.cos(y * f * 5.1 + z * f * 3.3 + x * f * 1.7) *
      Math.sin(z * f * 4.7 + x * f * 2.9 + y * f * 3.9)
    );
  }
  return n * 0.25;
}

// ─── WIREFRAME RESUME TEXTURE ────────────────────────────────────────────────
function buildResumeTexture(): THREE.CanvasTexture {
  const W = 1240, H = 1754;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Paper background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  const darkColor = "#1a1a1a";
  const mediumColor = "#444444";
  const lightColor = "#888888";
  const lineColor = "#cccccc";

  // ── Header bar (name) ────────────────────────────────────────
  ctx.fillStyle = darkColor;
  ctx.font = "bold 28px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("RESUME", W / 2, 114);

  // Contact info line
  ctx.fillStyle = mediumColor;
  roundRect(ctx, W / 2 - 280, 155, 560, 12, 3);
  ctx.fill();

  // ── Divider ─────────────────────────────────────────────────
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 230);
  ctx.lineTo(W - 120, 230);
  ctx.stroke();

  // ── Section: Summary ─────────────────────────────────────────
  roundRect(ctx, 120, 270, 180, 18, 3);
  ctx.fillStyle = darkColor;
  ctx.fill();

  for (let i = 0; i < 3; i++) {
    const widths = [920, 860, 780];
    roundRect(ctx, 120, 310 + i * 24, widths[i], 10, 2);
    ctx.fillStyle = lightColor;
    ctx.fill();
  }

  // ── Section: Experience ──────────────────────────────────────
  roundRect(ctx, 120, 430, 200, 18, 3);
  ctx.fillStyle = darkColor;
  ctx.fill();

  // Job 1
  roundRect(ctx, 120, 470, 340, 16, 3);
  ctx.fillStyle = darkColor;
  ctx.fill();
  roundRect(ctx, 470, 470, 150, 12, 2);
  ctx.fillStyle = mediumColor;
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    const widths = [880, 800, 840];
    roundRect(ctx, 140, 500 + i * 22, widths[i], 8, 2);
    ctx.fillStyle = lightColor;
    ctx.fill();
  }

  // Job 2
  roundRect(ctx, 120, 590, 340, 16, 3);
  ctx.fillStyle = darkColor;
  ctx.fill();
  roundRect(ctx, 470, 590, 150, 12, 2);
  ctx.fillStyle = mediumColor;
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    const widths = [860, 820, 780];
    roundRect(ctx, 140, 620 + i * 22, widths[i], 8, 2);
    ctx.fillStyle = lightColor;
    ctx.fill();
  }

  // Job 3
  roundRect(ctx, 120, 710, 340, 16, 3);
  ctx.fillStyle = darkColor;
  ctx.fill();
  roundRect(ctx, 470, 710, 150, 12, 2);
  ctx.fillStyle = mediumColor;
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    const widths = [840, 880, 760];
    roundRect(ctx, 140, 740 + i * 22, widths[i], 8, 2);
    ctx.fillStyle = lightColor;
    ctx.fill();
  }

  // ── Section: Skills ──────────────────────────────────────────
  roundRect(ctx, 120, 850, 120, 18, 3);
  ctx.fillStyle = darkColor;
  ctx.fill();

  for (let i = 0; i < 4; i++) {
    const widths = [900, 860, 920, 780];
    roundRect(ctx, 120, 890 + i * 24, widths[i], 10, 2);
    ctx.fillStyle = lightColor;
    ctx.fill();
  }

  // ── Section: Education ───────────────────────────────────────
  roundRect(ctx, 120, 1020, 160, 18, 3);
  ctx.fillStyle = darkColor;
  ctx.fill();

  roundRect(ctx, 120, 1060, 500, 14, 3);
  ctx.fillStyle = darkColor;
  ctx.fill();
  roundRect(ctx, 120, 1090, 280, 10, 2);
  ctx.fillStyle = lightColor;
  ctx.fill();

  // ── Section: Projects ────────────────────────────────────────
  roundRect(ctx, 120, 1160, 200, 18, 3);
  ctx.fillStyle = darkColor;
  ctx.fill();

  roundRect(ctx, 120, 1200, 340, 14, 3);
  ctx.fillStyle = darkColor;
  ctx.fill();
  roundRect(ctx, 120, 1226, 700, 8, 2);
  ctx.fillStyle = lightColor;
  ctx.fill();

  roundRect(ctx, 120, 1260, 340, 14, 3);
  ctx.fillStyle = darkColor;
  ctx.fill();
  roundRect(ctx, 120, 1286, 700, 8, 2);
  ctx.fillStyle = lightColor;
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ─── Helper: rounded rectangle ─────────────────────────────────
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── VERTEX SHADER ───────────────────────────────────────────────────────────
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;
  varying float vDisplacement;

  uniform float uTime;
  uniform float uProgress;
  uniform float uNoiseScale;

  float hash(float n){ return fract(sin(n)*43758.5453123); }

  float noise(vec3 x){
    vec3 i=floor(x); vec3 f=fract(x);
    f=f*f*(3.0-2.0*f);
    float n=i.x+i.y*57.0+113.0*i.z;
    return mix(
      mix(mix(hash(n),hash(n+1.0),f.x),mix(hash(n+57.0),hash(n+58.0),f.x),f.y),
      mix(mix(hash(n+113.0),hash(n+114.0),f.x),mix(hash(n+170.0),hash(n+171.0),f.x),f.y),
      f.z);
  }

  float fbm(vec3 p){
    float f=0.0,amp=1.0,freq=1.0;
    for(int i=0;i<5;i++){ f+=amp*noise(p*freq); freq*=2.1; amp*=0.5; }
    return f;
  }

  void main(){
    vUv = uv;
    vec3 pos = position;

    float glitch = smoothstep(0.0, 1.0, 1.0 - uProgress);
    
    float waveX = sin(pos.y * 3.0 + uTime * 0.5) * cos(pos.x * 2.5 + uTime * 0.3) * 0.03;
    float waveY = cos(pos.x * 3.5 + uTime * 0.4) * sin(pos.y * 2.8 + uTime * 0.6) * 0.03;
    float waveZ = sin(pos.x * 2.0 + pos.y * 2.0 + uTime * 0.7) * 0.02;

    float nv = fbm(pos*uNoiseScale + uTime*0.22*glitch);
    float nd = fbm(pos*uNoiseScale*2.4 + uTime*0.38*glitch);

    pos.x += nv*glitch*0.12 + waveX * (1.0 - glitch * 0.5);
    pos.y += nd*glitch*0.09 + waveY * (1.0 - glitch * 0.5);
    pos.z += fbm(pos*uNoiseScale)*glitch*0.07 + waveZ * (1.0 - glitch * 0.5);

    float breathe = sin(uTime * 0.8) * 0.02;
    pos.z += breathe * (1.0 - glitch * 0.7);

    vDisplacement = length(vec3(nv, nd, breathe));

    vec4 wp = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = wp.xyz;

    vec3 nv1 = pos + vec3(0.01, 0.0, 0.0);
    vec3 nv2 = pos + vec3(0.0, 0.01, 0.0);
    vNormal = normalize(cross(nv1 - pos, nv2 - pos));

    vec4 mvp = modelViewMatrix * vec4(pos, 1.0);
    vViewDirection = normalize(-mvp.xyz);

    gl_Position = projectionMatrix * mvp;
  }
`;

// ─── FRAGMENT SHADER ─────────────────────────────────────────────────────────
const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;
  varying float vDisplacement;

  uniform float uTime;
  uniform float uProgress;
  uniform sampler2D uTexture;
  uniform vec3 uLightPos1;
  uniform vec3 uLightPos2;

  void main(){
    vec2 uv = vUv;
    float glitch = smoothstep(0.0, 1.0, 1.0 - uProgress);

    vec3 col = texture2D(uTexture, uv).rgb;

    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewDirection);
    vec3 L1 = normalize(uLightPos1 - vWorldPosition);
    vec3 L2 = normalize(uLightPos2 - vWorldPosition);

    float diff1 = max(dot(N, L1), 0.0) * 0.5;
    float diff2 = max(dot(N, L2), 0.0) * 0.3;
    
    vec3 H1 = normalize(L1 + V);
    vec3 H2 = normalize(L2 + V);
    float spec1 = pow(max(dot(N, H1), 0.0), 32.0) * 0.3;
    float spec2 = pow(max(dot(N, H2), 0.0), 32.0) * 0.2;

    float ambient = 0.85;

    float light = clamp(ambient + diff1 + diff2 + spec1 + spec2, 0.0, 1.3);
    col *= light;

    float glitchBand1 = step(0.3, fract(uv.y * 15.0 + uTime * 0.1)) * step(fract(uv.y * 15.0 + uTime * 0.1), 0.35);
    float glitchBand2 = step(0.6, fract(uv.y * 20.0 - uTime * 0.15)) * step(fract(uv.y * 20.0 - uTime * 0.15), 0.65);
    
    col.r += sin(uTime * 2.0 + uv.y * 20.0) * 0.015 * glitch * (1.0 + glitchBand1);
    col.b -= sin(uTime * 2.0 + uv.y * 20.0) * 0.015 * glitch * (1.0 + glitchBand2);
    
    if(glitch > 0.3) {
      float rOffset = sin(uv.y * 50.0 + uTime * 5.0) * 0.003 * glitch;
      float bOffset = cos(uv.y * 50.0 + uTime * 5.0) * 0.003 * glitch;
      col.r = texture2D(uTexture, uv + vec2(rOffset, 0.0)).r;
      col.b = texture2D(uTexture, uv + vec2(bOffset, 0.0)).b;
    }

    float edgeFade = 1.0 - pow(abs(uv.x - 0.5) * 2.0, 2.0) * 0.1;
    col *= edgeFade;

    float paperGrain = fract(sin(dot(uv * 1000.0, vec2(12.9898, 78.233))) * 43758.5453) * 0.02;
    col += paperGrain * (1.0 - glitch);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// ─── PARTICLE VERTEX SHADER ──────────────────────────────────────────────────
const particleVertexShader = `
  attribute float aSize;
  attribute float aRandomOffset;
  
  varying float vAlpha;
  
  uniform float uTime;
  uniform float uProgress;
  
  void main() {
    vec3 pos = position;
    float glitch = smoothstep(0.0, 1.0, 1.0 - uProgress);
    
    float angle = aRandomOffset * 6.28318;
    float radius = 0.5 + aRandomOffset * 1.5;
    
    vec3 scatteredPos = vec3(
      cos(angle) * radius * glitch,
      sin(angle) * radius * glitch,
      (aRandomOffset - 0.5) * 2.0 * glitch
    );
    
    scatteredPos.x += sin(uTime * 2.0 + aRandomOffset * 10.0) * 0.1 * glitch;
    scatteredPos.y += cos(uTime * 2.5 + aRandomOffset * 8.0) * 0.1 * glitch;
    scatteredPos.z += sin(uTime * 1.8 + aRandomOffset * 12.0) * 0.15 * glitch;
    
    vec3 finalPos = mix(pos, pos + scatteredPos, glitch);
    
    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z) * (1.0 + glitch * 0.5);
    gl_Position = projectionMatrix * mvPosition;
    
    vAlpha = 0.3 + glitch * 0.7;
  }
`;

// ─── PARTICLE FRAGMENT SHADER ────────────────────────────────────────────────
const particleFragmentShader = `
  varying float vAlpha;
  
  uniform float uProgress;
  
  void main() {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;
    
    float glitch = smoothstep(0.0, 1.0, 1.0 - uProgress);
    float alpha = (1.0 - r) * vAlpha;
    
    // Slightly different shades of dark gray for particles
    vec3 color = mix(vec3(0.1, 0.1, 0.1), vec3(0.4, 0.4, 0.4), glitch);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// ─── SEEDED RANDOM HELPER ────────────────────────────────────────────────────
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

// ─── PARTICLES COMPONENT ─────────────────────────────────────────────────────
function GlitchParticles({ width, height, scrollProgress }: { width: number; height: number; scrollProgress: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const { geometry } = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const randomOffsets = new Float32Array(count);
    
    // Use seeded random for consistent values between server and client
    const rand = seededRandom(42);
    
    for (let i = 0; i < count; i++) {
      const x = (rand() - 0.5) * width * 1.1;
      const y = (rand() - 0.5) * height * 1.1;
      const z = (rand() - 0.5) * 0.01;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      sizes[i] = rand() * 0.02 + 0.005;
      randomOffsets[i] = rand();
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aRandomOffset', new THREE.BufferAttribute(randomOffsets, 1));
    
    return { geometry };
  }, [width, height]);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 1.0 },
  }), []);
  
  const timer = useMemo(() => new THREE.Timer(), []);
  
  useFrame(() => {
    if (!particlesRef.current) return;
    timer.update();
    const mat = particlesRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = timer.getElapsed();
    mat.uniforms.uProgress.value = scrollProgress;
  });
  
  return (
    <points ref={particlesRef} geometry={geometry}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ResumeGlitchScene({ scrollProgress }: ResumeGlitchSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { viewport, size } = useThree();
  const [isClient, setIsClient] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setIsClient(true);
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Only create texture on client side
  const texture = useMemo(() => {
    if (!isClient) return null;
    return buildResumeTexture();
  }, [isClient]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 1.0 },
    uNoiseScale: { value: 3.5 },
    uTexture: { value: texture || new THREE.Texture() },
    uLightPos1: { value: new THREE.Vector3(4,5,5) },
    uLightPos2: { value: new THREE.Vector3(-4,-3,4) },
  }), [texture]);

  // Responsive width calculation based on screen size
  const getResponsiveWidth = () => {
    const screenWidth = windowSize.width;
    if (screenWidth <= 360) return Math.min(viewport.width * 0.55, 1.1);
    if (screenWidth <= 480) return Math.min(viewport.width * 0.6, 1.25);
    if (screenWidth <= 768) return Math.min(viewport.width * 0.62, 1.35);
    if (screenWidth <= 1024) return Math.min(viewport.width * 0.63, 1.4);
    if (screenWidth <= 1366) return Math.min(viewport.width * 0.64, 1.45);
    if (screenWidth >= 2560) return Math.min(viewport.width * 0.5, 2.0);
    return Math.min(viewport.width * 0.64, 1.45);
  };

  const width = getResponsiveWidth();
  const height = width * 1.414;

  // Responsive noise scale for different screen sizes
  const getNoiseScale = () => {
    const screenWidth = windowSize.width;
    if (screenWidth <= 480) return 2.8;
    if (screenWidth <= 768) return 3.2;
    return 3.5;
  };

  const timer = useMemo(() => new THREE.Timer(), []);

  useFrame(({ mouse }) => {
    if (!meshRef.current || !groupRef.current) return;
    
    timer.update();
    
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = timer.getElapsed();
    mat.uniforms.uProgress.value = scrollProgress;
    mat.uniforms.uNoiseScale.value = getNoiseScale();
    
    // Reduced mouse interaction for smaller screens
    const screenWidth = windowSize.width;
    const mouseMultiplier = screenWidth <= 768 ? 0.5 : 1;
    
    const targetRotationX = mouse.y * 0.1 * mouseMultiplier;
    const targetRotationY = mouse.x * 0.15 * mouseMultiplier;
    
    groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.05;
    
    const floatY = Math.sin(timer.getElapsed() * 0.5) * 0.05;
    groupRef.current.position.y = floatY;
    
    mat.uniforms.uLightPos1.value.x = 4 + Math.sin(timer.getElapsed() * 0.3) * 2;
    mat.uniforms.uLightPos1.value.y = 5 + Math.cos(timer.getElapsed() * 0.4) * 2;
    mat.uniforms.uLightPos2.value.x = -4 + Math.cos(timer.getElapsed() * 0.35) * 2;
    mat.uniforms.uLightPos2.value.y = -3 + Math.sin(timer.getElapsed() * 0.45) * 2;
  });

  // Don't render until client-side to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <planeGeometry args={[width, height, 100, 100]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          side={THREE.DoubleSide}
        />
      </mesh>
      <GlitchParticles width={width} height={height} scrollProgress={scrollProgress} />
    </group>
  );
}