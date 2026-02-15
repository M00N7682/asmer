"use client";

import { useAnimationStore } from "@/store/animation-store";
import { FloatingOrbs } from "./FloatingOrbs";
import { ParticleFireflies } from "./ParticleFireflies";
import { AuroraWaves } from "./AuroraWaves";
import { BreathingPulse } from "./BreathingPulse";

export function AnimationCanvas() {
  const activeAnimation = useAnimationStore((s) => s.activeAnimation);

  if (activeAnimation === "none") return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {activeAnimation === "orbs" && <FloatingOrbs />}
      {activeAnimation === "fireflies" && <ParticleFireflies />}
      {activeAnimation === "aurora" && <AuroraWaves />}
      {activeAnimation === "pulse" && <BreathingPulse />}
      {/* immersion mode is handled separately as a fullscreen overlay */}
    </div>
  );
}
