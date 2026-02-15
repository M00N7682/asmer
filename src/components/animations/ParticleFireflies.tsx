"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAudioStore } from "@/store/audio-store";
import { useAnimationStore } from "@/store/animation-store";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  targetOpacity: number;
  hue: number;
  saturation: number;
  lightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
  life: number;
  maxLife: number;
}

const PARTICLE_COUNT = 60;

const soundHues: Record<string, number> = {
  rain: 220, wind: 260, waves: 200, thunder: 250,
  birds: 140, campfire: 30, forest: 150, creek: 190,
  cafe: 25, keyboard: 270, train: 230, clock: 280,
  city: 40, "white-noise": 0, "pink-noise": 320,
  "brown-noise": 30, "asmr-typing": 250, "asmr-whisper": 280,
  "asmr-fabric": 20, "asmr-storm": 240,
};

export function ParticleFireflies() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const sounds = useAudioStore((s) => s.sounds);
  const intensity = useAnimationStore((s) => s.intensity);

  const getActiveHues = useCallback((): number[] => {
    const activeIds = Object.entries(sounds)
      .filter(([, s]) => s.active)
      .map(([id]) => id);
    if (activeIds.length === 0) return [230, 260, 140]; // default blue/purple/green
    return activeIds.map((id) => soundHues[id] ?? 230);
  }, [sounds]);

  const createParticle = useCallback((w: number, h: number, hues: number[]): Particle => {
    const hue = hues[Math.floor(Math.random() * hues.length)];
    return {
      x: Math.random() * w,
      y: h + Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.2 + Math.random() * 0.6),
      size: 1.5 + Math.random() * 3,
      opacity: 0,
      targetOpacity: 0.3 + Math.random() * 0.7,
      hue,
      saturation: 70 + Math.random() * 30,
      lightness: 55 + Math.random() * 20,
      twinkleSpeed: 0.01 + Math.random() * 0.03,
      twinklePhase: Math.random() * Math.PI * 2,
      life: 0,
      maxLife: 300 + Math.random() * 400,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const hues = getActiveHues();
    const rect = canvas.getBoundingClientRect();

    // Initialize particles
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(rect.width, rect.height, hues)
    );
    // Spread initial particles across the screen
    particlesRef.current.forEach((p, i) => {
      p.y = Math.random() * rect.height;
      p.life = Math.random() * p.maxLife;
      p.opacity = p.targetOpacity * Math.sin((i / PARTICLE_COUNT) * Math.PI);
    });

    let time = 0;
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);
      time += 1;

      const intensityFactor = intensity / 100;
      const currentHues = getActiveHues();

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.life++;

        // Fade in/out
        if (p.life < 30) {
          p.opacity = (p.life / 30) * p.targetOpacity;
        } else if (p.life > p.maxLife - 60) {
          p.opacity = ((p.maxLife - p.life) / 60) * p.targetOpacity;
        }

        // Twinkle
        p.twinklePhase += p.twinkleSpeed;
        const twinkle = 0.5 + 0.5 * Math.sin(p.twinklePhase);

        // Drift
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy * intensityFactor;

        // Respawn
        if (p.y < -20 || p.life > p.maxLife) {
          particlesRef.current[i] = createParticle(w, h, currentHues);
        }

        // Draw glow
        const alpha = p.opacity * twinkle * intensityFactor;
        if (alpha < 0.01) continue;

        const glowSize = p.size * 6;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
        gradient.addColorStop(0, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${alpha})`);
        gradient.addColorStop(0.3, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${alpha * 0.4})`);
        gradient.addColorStop(1, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, ${Math.min(p.lightness + 20, 95)}%, ${alpha})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [intensity, getActiveHues, createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: intensity / 100 }}
    />
  );
}
