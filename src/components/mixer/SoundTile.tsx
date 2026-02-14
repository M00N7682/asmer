"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface SoundTileProps {
  name: string;
  icon: LucideIcon;
  active?: boolean;
  volume?: number;
  onToggle?: () => void;
  onVolumeChange?: (volume: number) => void;
}

export function SoundTile({
  name,
  icon: Icon,
  active = false,
  volume = 0,
  onToggle,
  onVolumeChange,
}: SoundTileProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex flex-col justify-between w-full h-[140px] p-4 rounded-[var(--radius-xl)] border transition-all cursor-pointer",
        active
          ? "bg-bg-surface border-[#22C55E33] shadow-[0_0_20px_rgba(34,197,94,0.08)]"
          : "bg-bg-surface border-border hover:border-border-dark"
      )}
    >
      <div className="flex items-start justify-between w-full">
        <Icon
          className={cn(
            "w-7 h-7",
            active ? "text-sound-active" : "text-text-tertiary"
          )}
        />
        <div
          className={cn(
            "w-2 h-2 rounded-sm",
            active ? "bg-sound-active" : "bg-text-muted"
          )}
        />
      </div>
      <div className="flex flex-col gap-1 w-full">
        <span
          className={cn(
            "text-[13px] font-medium text-left",
            active ? "text-text-primary" : "text-text-secondary"
          )}
        >
          {name}
        </span>
        <div
          className="w-full h-[3px] rounded-sm bg-bg-surface-hover overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            if (!onVolumeChange) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            onVolumeChange(Math.round((x / rect.width) * 100));
          }}
        >
          <div
            className={cn(
              "h-full rounded-sm transition-all",
              active ? "bg-sound-active" : "bg-text-muted"
            )}
            style={{ width: `${active ? volume : 0}%` }}
          />
        </div>
      </div>
    </button>
  );
}
