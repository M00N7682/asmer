"use client";

import { useMemo } from "react";
import { useAudioStore } from "@/store/audio-store";
import { useAnimationStore } from "@/store/animation-store";

const categoryPalettes: Record<string, string[]> = {
  Nature: ["#22C55E", "#06B6D4", "#10B981", "#059669"],
  Urban: ["#6366F1", "#8B5CF6", "#A78BFA", "#6366F1"],
  Noise: ["#6366F1", "#3B82F6", "#8B5CF6", "#4F46E5"],
  ASMR: ["#A78BFA", "#C4B5FD", "#8B5CF6", "#DDD6FE"],
};

const defaultPalette = ["#6366F1", "#8B5CF6", "#22C55E", "#06B6D4"];

const soundCategories: Record<string, string> = {
  rain: "Nature", wind: "Nature", waves: "Nature", thunder: "Nature",
  birds: "Nature", campfire: "Nature", forest: "Nature", creek: "Nature",
  cafe: "Urban", keyboard: "Urban", train: "Urban", clock: "Urban", city: "Urban",
  "white-noise": "Noise", "pink-noise": "Noise", "brown-noise": "Noise",
  "asmr-typing": "ASMR", "asmr-whisper": "ASMR", "asmr-fabric": "ASMR", "asmr-storm": "ASMR",
};

export function AuroraWaves() {
  const sounds = useAudioStore((s) => s.sounds);
  const intensity = useAnimationStore((s) => s.intensity);

  const colors = useMemo(() => {
    const activeSounds = Object.entries(sounds)
      .filter(([, s]) => s.active)
      .map(([id]) => id);

    if (activeSounds.length === 0) return defaultPalette;

    // Get dominant category
    const catCount: Record<string, number> = {};
    activeSounds.forEach((id) => {
      const cat = soundCategories[id] || "Nature";
      catCount[cat] = (catCount[cat] || 0) + 1;
    });
    const dominant = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "Nature";

    return categoryPalettes[dominant] || defaultPalette;
  }, [sounds]);

  const opacity = (intensity / 100) * 0.8;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      {/* Main SVG aurora */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1800 400"
        preserveAspectRatio="none"
        style={{ animation: "aurora-drift 60s linear infinite" }}
      >
        <defs>
          <linearGradient id="aurora-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors[0]} stopOpacity="0.5" />
            <stop offset="33%" stopColor={colors[1]} stopOpacity="0.3" />
            <stop offset="66%" stopColor={colors[2]} stopOpacity="0.4" />
            <stop offset="100%" stopColor={colors[0]} stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="aurora-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors[1]} stopOpacity="0.4" />
            <stop offset="50%" stopColor={colors[3]} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colors[2]} stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="aurora-grad-3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors[2]} stopOpacity="0.3" />
            <stop offset="50%" stopColor={colors[0]} stopOpacity="0.2" />
            <stop offset="100%" stopColor={colors[3]} stopOpacity="0.15" />
          </linearGradient>
          <filter id="aurora-blur">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        <g filter="url(#aurora-blur)" style={{ animation: "aurora-glow 8s ease-in-out infinite" }}>
          {/* Wave 1 - Front */}
          <path
            fill="url(#aurora-grad-1)"
            style={{ animation: "aurora-shift-1 12s ease-in-out infinite" }}
            d="M0,200 C200,150 400,250 600,180 C800,110 1000,220 1200,160 C1400,100 1600,200 1800,150 L1800,400 L0,400 Z"
          />
          {/* Wave 2 - Middle */}
          <path
            fill="url(#aurora-grad-2)"
            style={{ animation: "aurora-shift-2 15s ease-in-out infinite" }}
            d="M0,240 C200,180 400,280 600,200 C800,150 1000,260 1200,190 C1400,130 1600,240 1800,180 L1800,400 L0,400 Z"
          />
          {/* Wave 3 - Back */}
          <path
            fill="url(#aurora-grad-3)"
            style={{ animation: "aurora-shift-3 18s ease-in-out infinite" }}
            d="M0,270 C200,220 400,310 600,240 C800,180 1000,290 1200,220 C1400,170 1600,270 1800,210 L1800,400 L0,400 Z"
          />
        </g>
      </svg>

      {/* Top edge glow */}
      <div
        className="absolute top-0 left-0 right-0 h-1/3"
        style={{
          background: `linear-gradient(to bottom, ${colors[0]}10, transparent)`,
        }}
      />

      {/* Scattered light spots */}
      <div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          left: "20%",
          top: "30%",
          background: `radial-gradient(circle, ${colors[1]}15, transparent 70%)`,
          filter: "blur(40px)",
          animation: "orb-float-3 20s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 150,
          height: 150,
          left: "70%",
          top: "25%",
          background: `radial-gradient(circle, ${colors[2]}15, transparent 70%)`,
          filter: "blur(35px)",
          animation: "orb-float-5 25s ease-in-out infinite",
        }}
      />
    </div>
  );
}
