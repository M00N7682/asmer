"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { TimerCircle } from "@/components/timer/TimerCircle";
import { useTimerStore, type TimerPhase } from "@/store/timer-store";
import { useAudioStore } from "@/store/audio-store";
import { sounds as soundList } from "@/audio/sounds";
import { cn } from "@/lib/utils";
import {
  Brain, Coffee, Sunset,
  Pause, Play, SkipForward, RotateCcw,
} from "lucide-react";

const phases: { key: TimerPhase; label: string; icon: typeof Brain }[] = [
  { key: "focus", label: "Focus", icon: Brain },
  { key: "shortBreak", label: "Short Break", icon: Coffee },
  { key: "longBreak", label: "Long Break", icon: Sunset },
];

export default function TimerPage() {
  const timer = useTimerStore();
  const audioStore = useAudioStore();

  const totalSeconds =
    timer.phase === "focus"
      ? timer.settings.focusMinutes * 60
      : timer.phase === "shortBreak"
      ? timer.settings.shortBreakMinutes * 60
      : timer.settings.longBreakMinutes * 60;

  const isBreak = timer.phase !== "focus";
  const accentColor = isBreak ? "text-accent-green-bright" : "text-accent";

  const activeSounds = Object.entries(audioStore.sounds)
    .filter(([, s]) => s.active)
    .map(([id, s]) => {
      const meta = soundList.find((m) => m.id === id);
      return meta ? { ...meta, volume: s.volume } : null;
    })
    .filter(Boolean) as (typeof soundList[0] & { volume: number })[];

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 px-5 md:px-20 py-8 md:py-12 flex-1 pb-20 md:pb-12">
        {/* Timer Main */}
        <div className="flex flex-col items-center gap-6 md:gap-10 flex-1">
          {/* Header */}
          <div className="flex flex-col gap-1 w-full">
            <span className={cn("text-[11px] font-semibold tracking-[2px]", accentColor)}>
              POMODORO TIMER
            </span>
            <h1 className="text-[28px] font-bold text-text-primary">
              Stay in the Flow
            </h1>
          </div>

          {/* Phase selector */}
          <div className="flex items-center gap-2">
            {phases.map((p) => (
              <button
                key={p.key}
                onClick={() => timer.setPhase(p.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer",
                  timer.phase === p.key
                    ? isBreak
                      ? "bg-accent-green-bright text-white font-semibold"
                      : "bg-accent text-white font-semibold"
                    : "bg-glass-bg text-text-tertiary border border-border hover:bg-bg-surface-hover"
                )}
              >
                <p.icon className="w-3.5 h-3.5" />
                {p.label}
              </button>
            ))}
          </div>

          {/* Big Timer Circle */}
          <div className="relative">
            {/* Outer glow */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${isBreak ? "#22C55E08" : "#6366F108"} 40%, transparent 100%)`,
                width: 360,
                height: 360,
              }}
            />
            <TimerCircle
              size="lg"
              remaining={timer.remaining}
              total={totalSeconds}
              phase={timer.phase}
              session={timer.currentSession}
              totalSessions={timer.settings.sessionsBeforeLong}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={timer.isRunning ? timer.pauseTimer : timer.startTimer}
              className={cn(
                "flex items-center justify-center w-14 h-14 rounded-full text-white cursor-pointer",
                isBreak ? "bg-accent-green-bright shadow-[0_4px_20px_rgba(34,197,94,0.25)]" : "bg-accent shadow-[0_4px_20px_rgba(99,102,241,0.25)]"
              )}
            >
              {timer.isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button
              onClick={timer.skipPhase}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-glass-bg border border-border text-text-secondary cursor-pointer"
            >
              <SkipForward className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={timer.resetTimer}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-glass-bg border border-border text-text-secondary cursor-pointer"
            >
              <RotateCcw className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Session dots */}
          <div className="flex items-center gap-2.5">
            {Array.from({ length: timer.settings.sessionsBeforeLong }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  i < timer.currentSession
                    ? isBreak ? "bg-accent-green-bright" : "bg-accent"
                    : i === timer.currentSession - 1
                    ? isBreak ? "bg-accent-green-bright/70" : "bg-accent/70"
                    : "bg-[#1a1a1a] border border-border"
                )}
              />
            ))}
            <span className="text-[10px] font-mono text-text-muted ml-1">
              {timer.currentSession} / {timer.settings.sessionsBeforeLong} sessions
            </span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 w-full lg:w-[380px]">
          {/* Timer Settings */}
          <div className="flex flex-col gap-5 p-6 rounded-[var(--radius-xl)] bg-bg-surface border border-border">
            <span className="text-[10px] font-semibold tracking-[2px] text-accent">
              TIMER SETTINGS
            </span>

            {[
              { label: "Focus", value: `${timer.settings.focusMinutes} min` },
              { label: "Short Break", value: `${timer.settings.shortBreakMinutes} min` },
              { label: "Long Break", value: `${timer.settings.longBreakMinutes} min` },
              { label: "Sessions", value: `${timer.settings.sessionsBeforeLong}` },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-text-secondary">{row.label}</span>
                <span className="text-xs font-mono font-semibold text-text-primary bg-glass-bg border border-border rounded-[var(--radius-sm)] px-3 py-1">
                  {row.value}
                </span>
              </div>
            ))}

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-text-secondary">
                Auto volume on break
              </span>
              <button
                onClick={() => timer.updateSettings({ autoVolume: !timer.settings.autoVolume })}
                className={cn(
                  "relative w-10 h-[22px] rounded-full transition-colors cursor-pointer",
                  timer.settings.autoVolume ? "bg-accent" : "bg-border-dark"
                )}
              >
                <div
                  className={cn(
                    "absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white transition-transform",
                    timer.settings.autoVolume ? "left-5" : "left-[2px]"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Now Playing */}
          <div className="flex flex-col gap-4 p-6 rounded-[var(--radius-xl)] bg-bg-surface border border-border">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-[2px] text-sound-active">
                NOW PLAYING
              </span>
              <span className="text-[10px] font-mono text-text-muted">
                {activeSounds.length} sounds
              </span>
            </div>

            {activeSounds.length > 0 ? (
              activeSounds.map((s) => (
                <div key={s.id} className="flex items-center gap-2.5">
                  <s.icon className="w-4 h-4 text-sound-active shrink-0" />
                  <span className="text-[13px] font-medium text-text-primary flex-1">
                    {s.name}
                  </span>
                  <span className="text-[10px] font-mono text-text-tertiary">
                    {s.volume}%
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-text-muted">No sounds active</p>
            )}

            <Link href="/mix" className="text-xs font-medium text-accent hover:text-accent-hover transition-colors">
              Open Mixer →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
