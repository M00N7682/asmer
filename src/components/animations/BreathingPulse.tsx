"use client";

import { useMemo } from "react";
import { useAudioStore } from "@/store/audio-store";
import { useAnimationStore } from "@/store/animation-store";

export function BreathingPulse() {
  const sounds = useAudioStore((s) => s.sounds);
  const intensity = useAnimationStore((s) => s.intensity);

  const color = useMemo(() => {
    const activeSounds = Object.entries(sounds)
      .filter(([, s]) => s.active)
      .map(([id]) => id);

    if (activeSounds.length === 0) return "#6366F1";
    // Pick color from first active sound
    const id = activeSounds[0];
    const colorMap: Record<string, string> = {
      rain: "#3B82F6", wind: "#8B5CF6", waves: "#0EA5E9", thunder: "#6366F1",
      birds: "#22C55E", campfire: "#F59E0B", forest: "#10B981", creek: "#06B6D4",
      cafe: "#D89575", keyboard: "#8B5CF6", train: "#6366F1", clock: "#A78BFA",
      city: "#F59E0B", "white-noise": "#A0A0A0", "pink-noise": "#EC4899",
      "brown-noise": "#92400E", "asmr-typing": "#6366F1", "asmr-whisper": "#A78BFA",
      "asmr-fabric": "#D89575", "asmr-storm": "#4F46E5",
    };
    return colorMap[id] || "#6366F1";
  }, [sounds]);

  const opacity = intensity / 100;
  const cycleDuration = "4s";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center" style={{ opacity }}>
      {/* Outermost ring */}
      <div
        className="absolute rounded-full will-change-transform"
        style={{
          width: 600,
          height: 600,
          background: `radial-gradient(circle, ${color}06, ${color}02, transparent 70%)`,
          animation: `pulse-ring-3 ${cycleDuration} ease-in-out infinite`,
        }}
      />
      {/* Third ring */}
      <div
        className="absolute rounded-full will-change-transform"
        style={{
          width: 450,
          height: 450,
          background: `radial-gradient(circle, ${color}0A, ${color}04, transparent 70%)`,
          animation: `pulse-ring-2 ${cycleDuration} ease-in-out infinite`,
          animationDelay: "0.2s",
        }}
      />
      {/* Second ring */}
      <div
        className="absolute rounded-full will-change-transform"
        style={{
          width: 300,
          height: 300,
          background: `radial-gradient(circle, ${color}15, ${color}08, transparent 70%)`,
          animation: `pulse-ring-1 ${cycleDuration} ease-in-out infinite`,
          animationDelay: "0.4s",
        }}
      />
      {/* Core glow */}
      <div
        className="absolute rounded-full will-change-transform"
        style={{
          width: 160,
          height: 160,
          background: `radial-gradient(circle, ${color}30, ${color}15, transparent 70%)`,
          filter: "blur(20px)",
          animation: `pulse-breathe ${cycleDuration} ease-in-out infinite`,
        }}
      />
      {/* Bright center */}
      <div
        className="absolute rounded-full will-change-transform"
        style={{
          width: 60,
          height: 60,
          background: `radial-gradient(circle, ${color}50, ${color}20, transparent 70%)`,
          filter: "blur(8px)",
          animation: `pulse-breathe ${cycleDuration} ease-in-out infinite`,
          animationDelay: "0.1s",
        }}
      />
    </div>
  );
}
