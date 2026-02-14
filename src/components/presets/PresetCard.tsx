"use client";

import { Play } from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface PresetCardProps {
  name: string;
  description: string;
  gradientFrom?: string;
  gradientTo?: string;
  soundIcons?: LucideIcon[];
  onPlay?: () => void;
}

export function PresetCard({
  name,
  description,
  gradientFrom = "#6366F133",
  gradientTo = "#0A0A0A00",
  soundIcons = [],
  onPlay,
}: PresetCardProps) {
  return (
    <div className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-bg-surface overflow-hidden">
      <div
        className="relative h-20 w-full"
        style={{
          background: `linear-gradient(180deg, ${gradientFrom}, ${gradientTo})`,
        }}
      >
        <div
          className="absolute w-[60px] h-[60px] rounded-full opacity-50"
          style={{
            background: gradientFrom.replace("33", "15"),
            left: "20px",
            top: "30px",
          }}
        />
        <div
          className="absolute w-20 h-20 rounded-full opacity-40"
          style={{
            background: gradientFrom.replace("33", "10"),
            left: "80px",
            top: "20px",
          }}
        />
      </div>
      <div className="flex flex-col gap-3 p-5 pt-0">
        <h3 className="text-base font-semibold text-text-primary">{name}</h3>
        <p className="text-[11px] font-mono text-text-tertiary">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {soundIcons.map((Icon, i) => (
              <Icon key={i} className="w-3.5 h-3.5 text-text-muted" />
            ))}
          </div>
          <button
            onClick={onPlay}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-accent rounded-full hover:bg-accent-hover transition-colors cursor-pointer"
          >
            <Play className="w-3 h-3" />
            Play
          </button>
        </div>
      </div>
    </div>
  );
}
