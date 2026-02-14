"use client";

import { Volume2 } from "lucide-react";
import { useAudioStore } from "@/store/audio-store";

export function MasterVolume() {
  const { masterVolume, setMasterVolume } = useAudioStore();

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] bg-bg-surface border border-border">
      <Volume2 className="w-5 h-5 text-accent shrink-0" />
      <div
        className="relative flex-1 h-1.5 rounded-sm bg-[#1a1a1a] cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          setMasterVolume(Math.round((x / rect.width) * 100));
        }}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-sm"
          style={{
            width: `${masterVolume}%`,
            background: "linear-gradient(90deg, var(--accent), var(--accent-secondary))",
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
          style={{ left: `calc(${masterVolume}% - 7px)` }}
        />
      </div>
      <span className="text-xs font-mono font-semibold text-text-secondary w-8 text-right">
        {masterVolume}%
      </span>
    </div>
  );
}
