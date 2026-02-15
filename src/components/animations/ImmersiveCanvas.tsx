"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAudioStore } from "@/store/audio-store";
import { useAnimationStore } from "@/store/animation-store";

/**
 * Depth-warp particle system.
 * Particles spawn at random depth (far away) and fly toward the viewer,
 * creating a "being pulled in" tunnel/warp effect.
 * Combined with slow global rotation for a hypnotic spiral feel.
 */

interface WarpParticle {
  // 3D position (projected to 2D)
  x: number;
  y: number;
  z: number;
  // Visual
  size: number;
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
  // Trail
  prevScreenX: number;
  prevScreenY: number;
}

const PARTICLE_COUNT = 200;
const MAX_DEPTH = 1500;
const SPEED = 2.5;
const FOV = 300;

const soundHues: Record<string, number> = {
  rain: 220, wind: 260, waves: 200, thunder: 250,
  birds: 140, campfire: 30, forest: 150, creek: 190,
  cafe: 25, keyboard: 270, train: 230, clock: 280,
  city: 40, "white-noise": 0, "pink-noise": 320,
  "brown-noise": 30, "asmr-typing": 250, "asmr-whisper": 280,
  "asmr-fabric": 20, "asmr-storm": 240,
};

export function ImmersiveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<WarpParticle[]>([]);
  const rafRef = useRef<number>(0);
  const rotationRef = useRef(0);
  const sounds = useAudioStore((s) => s.sounds);
  const intensity = useAnimationStore((s) => s.intensity);

  const getActiveHues = useCallback((): number[] => {
    const activeIds = Object.entries(sounds)
      .filter(([, s]) => s.active)
      .map(([id]) => id);
    if (activeIds.length === 0) return [230, 260, 280, 200];
    return activeIds.map((id) => soundHues[id] ?? 230);
  }, [sounds]);

  const createParticle = useCallback((w: number, h: number, hues: number[], far?: boolean): WarpParticle => {
    const hue = hues[Math.floor(Math.random() * hues.length)] + (Math.random() - 0.5) * 30;
    // Spawn in a ring around center, at far depth
    const angle = Math.random() * Math.PI * 2;
    const radius = 50 + Math.random() * Math.max(w, h) * 0.5;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z: far ? MAX_DEPTH * Math.random() : MAX_DEPTH * (0.8 + Math.random() * 0.2),
      size: 1 + Math.random() * 2,
      hue,
      saturation: 60 + Math.random() * 40,
      lightness: 50 + Math.random() * 30,
      alpha: 0,
      prevScreenX: w / 2,
      prevScreenY: h / 2,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w: number, h: number;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const hues = getActiveHues();
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(w, h, hues, true)
    );

    const animate = () => {
      ctx.fillStyle = "rgba(10, 10, 10, 0.15)";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const intensityFactor = intensity / 100;
      const currentHues = getActiveHues();

      // Slow rotation
      rotationRef.current += 0.0008 * intensityFactor;
      const rot = rotationRef.current;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];

        // Move toward viewer
        p.z -= SPEED * intensityFactor * (1 + (1 - p.z / MAX_DEPTH) * 2);

        // Respawn if too close
        if (p.z <= 1) {
          particlesRef.current[i] = createParticle(w, h, currentHues);
          continue;
        }

        // 3D → 2D projection with rotation
        const rx = p.x * cosR - p.y * sinR;
        const ry = p.x * sinR + p.y * cosR;
        const scale = FOV / p.z;
        const screenX = cx + rx * scale;
        const screenY = cy + ry * scale;

        // Depth-based alpha (closer = brighter)
        const depthRatio = 1 - p.z / MAX_DEPTH;
        p.alpha = depthRatio * depthRatio * intensityFactor;

        if (p.alpha < 0.01) {
          p.prevScreenX = screenX;
          p.prevScreenY = screenY;
          continue;
        }

        // Draw trail line (warp streak)
        const trailAlpha = p.alpha * 0.6;
        if (trailAlpha > 0.02) {
          ctx.beginPath();
          ctx.moveTo(p.prevScreenX, p.prevScreenY);
          ctx.lineTo(screenX, screenY);
          ctx.strokeStyle = `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${trailAlpha})`;
          ctx.lineWidth = p.size * depthRatio * 1.5;
          ctx.stroke();
        }

        // Draw particle glow
        const glowSize = p.size * (1 + depthRatio * 6);
        const gradient = ctx.createRadialGradient(
          screenX, screenY, 0,
          screenX, screenY, glowSize
        );
        gradient.addColorStop(0, `hsla(${p.hue}, ${p.saturation}%, ${Math.min(p.lightness + 20, 95)}%, ${p.alpha})`);
        gradient.addColorStop(0.4, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${p.alpha * 0.5})`);
        gradient.addColorStop(1, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, 0)`);

        ctx.beginPath();
        ctx.arc(screenX, screenY, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.size * depthRatio * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, ${Math.min(p.lightness + 30, 98)}%, ${p.alpha * 0.9})`;
        ctx.fill();

        p.prevScreenX = screenX;
        p.prevScreenY = screenY;
      }

      // Center glow (pull-in focal point)
      const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120 * intensityFactor);
      centerGlow.addColorStop(0, `hsla(${currentHues[0] ?? 230}, 60%, 60%, ${0.04 * intensityFactor})`);
      centerGlow.addColorStop(0.5, `hsla(${currentHues[0] ?? 230}, 50%, 40%, ${0.02 * intensityFactor})`);
      centerGlow.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, 120 * intensityFactor, 0, Math.PI * 2);
      ctx.fillStyle = centerGlow;
      ctx.fill();

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
      className="absolute inset-0 w-full h-full"
      style={{ opacity: intensity / 100 }}
    />
  );
}
