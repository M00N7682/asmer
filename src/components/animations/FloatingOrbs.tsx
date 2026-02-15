"use client";

import { useMemo } from "react";
import { useAudioStore } from "@/store/audio-store";
import { useAnimationStore } from "@/store/animation-store";

// Map sound categories to gradient colors
const categoryColors: Record<string, [string, string]> = {
  rain: ["#6366F1", "#3B82F6"],
  wind: ["#8B5CF6", "#6366F1"],
  waves: ["#0EA5E9", "#6366F1"],
  thunder: ["#8B5CF6", "#4F46E5"],
  birds: ["#22C55E", "#10B981"],
  campfire: ["#F59E0B", "#EF4444"],
  forest: ["#22C55E", "#059669"],
  creek: ["#06B6D4", "#3B82F6"],
  cafe: ["#D89575", "#B45309"],
  keyboard: ["#8B5CF6", "#6366F1"],
  train: ["#6366F1", "#4F46E5"],
  clock: ["#8B5CF6", "#A78BFA"],
  city: ["#F59E0B", "#6366F1"],
  "white-noise": ["#A0A0A0", "#666666"],
  "pink-noise": ["#EC4899", "#8B5CF6"],
  "brown-noise": ["#92400E", "#78350F"],
  "asmr-typing": ["#6366F1", "#8B5CF6"],
  "asmr-whisper": ["#A78BFA", "#C4B5FD"],
  "asmr-fabric": ["#D89575", "#A78BFA"],
  "asmr-storm": ["#4F46E5", "#6366F1"],
};

const defaultColors: [string, string][] = [
  ["#6366F1", "#8B5CF6"],
  ["#8B5CF6", "#6366F1"],
  ["#22C55E", "#059669"],
  ["#3B82F6", "#6366F1"],
  ["#D89575", "#8B5CF6"],
  ["#06B6D4", "#3B82F6"],
];

const orbConfigs = [
  { size: 320, x: "15%", y: "20%", animation: "orb-float-1", duration: "20s", blur: 80 },
  { size: 260, x: "65%", y: "15%", animation: "orb-float-2", duration: "25s", blur: 90 },
  { size: 200, x: "40%", y: "60%", animation: "orb-float-3", duration: "18s", blur: 70 },
  { size: 280, x: "80%", y: "55%", animation: "orb-float-4", duration: "22s", blur: 85 },
  { size: 180, x: "25%", y: "75%", animation: "orb-float-5", duration: "16s", blur: 60 },
  { size: 240, x: "55%", y: "40%", animation: "orb-float-1", duration: "28s", blur: 75 },
];

export function FloatingOrbs() {
  const sounds = useAudioStore((s) => s.sounds);
  const intensity = useAnimationStore((s) => s.intensity);

  const orbColors = useMemo(() => {
    const activeSounds = Object.entries(sounds)
      .filter(([, s]) => s.active)
      .map(([id]) => id);

    if (activeSounds.length === 0) return defaultColors;

    const colors: [string, string][] = [];
    for (let i = 0; i < 6; i++) {
      const soundId = activeSounds[i % activeSounds.length];
      colors.push(categoryColors[soundId] || defaultColors[i % defaultColors.length]);
    }
    return colors;
  }, [sounds]);

  const opacity = intensity / 100;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      {orbConfigs.map((orb, i) => {
        const [c1, c2] = orbColors[i] || defaultColors[i];
        return (
          <div
            key={i}
            className="absolute rounded-full will-change-transform"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              background: `radial-gradient(circle at 40% 40%, ${c1}40, ${c2}20, transparent 70%)`,
              filter: `blur(${orb.blur}px)`,
              animation: `${orb.animation} ${orb.duration} ease-in-out infinite`,
              animationDelay: `${i * -3}s`,
            }}
          />
        );
      })}
      {/* Subtle noise overlay for texture */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
