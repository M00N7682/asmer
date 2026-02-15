"use client";

import { cn } from "@/lib/utils";
import { useAnimationStore, type AnimationType } from "@/store/animation-store";
import {
  Circle,
  Sparkles,
  Waves,
  Target,
  Maximize2,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";

const animations: {
  id: AnimationType;
  name: string;
  icon: typeof Circle;
  desc: string;
}[] = [
  { id: "none", name: "Off", icon: X, desc: "No animation" },
  { id: "orbs", name: "Floating Orbs", icon: Circle, desc: "Soft gradient blobs" },
  { id: "fireflies", name: "Fireflies", icon: Sparkles, desc: "Glowing particles" },
  { id: "aurora", name: "Aurora", icon: Waves, desc: "Flowing wave ribbons" },
  { id: "pulse", name: "Pulse", icon: Target, desc: "Breathing radial glow" },
  { id: "immersion", name: "Immersion", icon: Maximize2, desc: "Fullscreen mode" },
];

export function AnimationPicker() {
  const { activeAnimation, setAnimation, intensity, setIntensity, openImmersion } =
    useAnimationStore();
  const [showIntensity, setShowIntensity] = useState(false);

  const handleSelect = (id: AnimationType) => {
    if (id === "immersion") {
      openImmersion();
      return;
    }
    setAnimation(id);
  };

  return (
    <div className="flex flex-col gap-3 p-5 rounded-[var(--radius-xl)] bg-bg-surface border border-border">
      <div className="flex items-center justify-between w-full">
        <span className="text-[10px] font-semibold tracking-[2px] text-accent">
          AMBIENCE
        </span>
        {activeAnimation !== "none" && (
          <button
            onClick={() => setShowIntensity(!showIntensity)}
            className="flex items-center gap-1 text-[11px] font-medium text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3" />
            {intensity}%
          </button>
        )}
      </div>

      {/* Animation options grid */}
      <div className="grid grid-cols-3 gap-2">
        {animations.map((anim) => {
          const isActive = anim.id === activeAnimation;
          const isOff = anim.id === "none";
          const isImmersion = anim.id === "immersion";
          return (
            <button
              key={anim.id}
              onClick={() => handleSelect(anim.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-[var(--radius-md)] border transition-all cursor-pointer",
                isActive && isOff
                  ? "bg-[#FFFFFF0A] border-[#FFFFFF20] text-text-secondary"
                  : isActive
                  ? "bg-[#6366F115] border-[#6366F140] text-accent"
                  : isImmersion
                  ? "bg-glass-bg border-border hover:bg-[#6366F110] hover:border-[#6366F130] text-text-tertiary hover:text-accent"
                  : "bg-glass-bg border-border hover:bg-bg-surface-hover text-text-tertiary hover:text-text-secondary"
              )}
            >
              <anim.icon className="w-4 h-4" />
              <span className="text-[10px] font-medium leading-none">{anim.name}</span>
            </button>
          );
        })}
      </div>

      {/* Intensity slider */}
      {showIntensity && activeAnimation !== "none" && (
        <div className="flex items-center gap-3 pt-1">
          <span className="text-[10px] font-mono text-text-muted w-5 shrink-0">
            {intensity}
          </span>
          <div className="relative flex-1 h-8 flex items-center">
            <div className="absolute w-full h-[3px] rounded-sm bg-bg-surface-hover" />
            <div
              className="absolute h-[3px] rounded-sm bg-accent"
              style={{ width: `${intensity}%` }}
            />
            <input
              type="range"
              min={10}
              max={100}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="absolute w-full h-8 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
