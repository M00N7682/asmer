"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { CategoryTabs } from "@/components/mixer/CategoryTabs";
import { SoundGrid } from "@/components/mixer/SoundGrid";
import { MasterVolume } from "@/components/mixer/MasterVolume";
import { TimerCircle } from "@/components/timer/TimerCircle";
import { useAudioStore } from "@/store/audio-store";
import { useTimerStore } from "@/store/timer-store";
import { type SoundCategory } from "@/audio/sounds";
import {
  Pause, Play, SkipForward, RotateCcw,
  CloudRain, Moon, Trees, Code,
} from "lucide-react";

const quickPresets = [
  { id: "rainy-cafe", name: "Rainy Cafe", icon: CloudRain, iconColor: "text-accent", sounds: ["rain", "cafe", "thunder"] },
  { id: "deep-night", name: "Deep Night", icon: Moon, iconColor: "text-sound-active", sounds: ["brown-noise", "clock", "wind"], active: true },
  { id: "forest-cabin", name: "Forest Cabin", icon: Trees, iconColor: "text-accent", sounds: ["forest", "birds", "campfire"] },
  { id: "coding-mode", name: "Coding Mode", icon: Code, iconColor: "text-accent", sounds: ["pink-noise", "keyboard", "cafe"] },
];

export default function MixerPage() {
  const [category, setCategory] = useState<SoundCategory>("All");
  const audioStore = useAudioStore();
  const timer = useTimerStore();

  const activeCount = Object.values(audioStore.sounds).filter((s) => s.active).length;
  const totalSeconds = timer.phase === "focus"
    ? timer.settings.focusMinutes * 60
    : timer.phase === "shortBreak"
    ? timer.settings.shortBreakMinutes * 60
    : timer.settings.longBreakMinutes * 60;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 p-4 md:p-8 flex-1 pb-20 md:pb-8">
        {/* Main content */}
        <div className="flex flex-col gap-4 md:gap-6 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold tracking-[2px] text-accent">
                SOUND MIXER
              </span>
              <h1 className="text-2xl font-bold text-text-primary">
                Create Your Soundscape
              </h1>
            </div>
            {activeCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#22C55E15] border border-[#22C55E33]">
                <div className="w-1.5 h-1.5 rounded-full bg-sound-active" />
                <span className="text-[11px] font-mono font-medium text-sound-active">
                  {activeCount} active
                </span>
              </div>
            )}
          </div>

          {/* Category tabs */}
          <CategoryTabs
            activeCategory={category}
            onCategoryChange={setCategory}
          />

          {/* Sound grid */}
          <SoundGrid category={category} />
        </div>

        {/* Sidebar */}
        <div className="hidden lg:flex flex-col gap-6 w-80">
          {/* Master Volume */}
          <MasterVolume />

          {/* Mini Timer */}
          <div className="flex flex-col items-center gap-4 p-6 rounded-[var(--radius-xl)] bg-bg-surface border border-border">
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-semibold tracking-[2px] text-accent">
                POMODORO
              </span>
              <Link href="/timer" className="text-[11px] font-medium text-text-tertiary hover:text-text-secondary transition-colors">
                Full View →
              </Link>
            </div>

            <TimerCircle
              size="sm"
              remaining={timer.remaining}
              total={totalSeconds}
              phase={timer.phase}
            />

            <div className="flex items-center gap-3">
              <button
                onClick={timer.isRunning ? timer.pauseTimer : timer.startTimer}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-accent text-white cursor-pointer"
              >
                {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={timer.skipPhase}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-glass-bg border border-border text-text-secondary cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              <button
                onClick={timer.resetTimer}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-glass-bg border border-border text-text-secondary cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-col gap-3 p-5 rounded-[var(--radius-xl)] bg-bg-surface border border-border">
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-semibold tracking-[2px] text-accent">
                QUICK PRESETS
              </span>
              <Link href="/presets" className="text-[11px] font-medium text-text-tertiary hover:text-text-secondary transition-colors">
                All →
              </Link>
            </div>

            {quickPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => audioStore.applyPreset(preset.sounds)}
                className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-[var(--radius-md)] transition-colors cursor-pointer ${
                  preset.active
                    ? "bg-[#22C55E08] border border-[#22C55E22]"
                    : "bg-glass-bg border border-border hover:bg-bg-surface-hover"
                }`}
              >
                <preset.icon className={`w-4 h-4 shrink-0 ${preset.active ? "text-sound-active" : preset.iconColor}`} />
                <span className="text-[13px] font-medium text-text-primary flex-1 text-left">
                  {preset.name}
                </span>
                {preset.active ? (
                  <span className="text-[9px] font-mono font-semibold text-sound-active bg-[#22C55E20] px-2 py-0.5 rounded-full">
                    Active
                  </span>
                ) : (
                  <Play className="w-3.5 h-3.5 text-text-tertiary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
