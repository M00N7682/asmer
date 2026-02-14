"use client";

import Link from "next/link";
import { useAudioStore } from "@/store/audio-store";
import { sounds as soundList } from "@/audio/sounds";
import { Play, Pause, Volume2 } from "lucide-react";

export function MiniPlayer() {
  const audioStore = useAudioStore();
  const activeCount = Object.values(audioStore.sounds).filter((s) => s.active).length;

  if (activeCount === 0) return null;

  const activeNames = Object.entries(audioStore.sounds)
    .filter(([, s]) => s.active)
    .map(([id]) => soundList.find((m) => m.id === id)?.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 md:hidden">
      <Link
        href="/mix"
        className="flex items-center gap-3 mx-3 px-4 py-3 rounded-[var(--radius-lg)] bg-bg-surface border border-border backdrop-blur-md"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent">
          <Volume2 className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-text-primary truncate">{activeNames}</p>
          <p className="text-[10px] text-text-muted">{activeCount} sounds playing</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-glass-bg border border-border cursor-pointer">
            <Pause className="w-3.5 h-3.5 text-text-primary" />
          </button>
        </div>
      </Link>
    </div>
  );
}
