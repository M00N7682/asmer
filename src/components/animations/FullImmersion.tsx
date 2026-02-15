"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAnimationStore } from "@/store/animation-store";
import { useAudioStore } from "@/store/audio-store";
import { useTimerStore } from "@/store/timer-store";
import { ImmersiveCanvas } from "./ImmersiveCanvas";
import { Pause, Play, Minimize2, SkipForward, Volume2 } from "lucide-react";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function FullImmersion() {
  const { immersionOpen, closeImmersion, openImmersion } = useAnimationStore();
  const sounds = useAudioStore((s) => s.sounds);
  const masterVolume = useAudioStore((s) => s.masterVolume);
  const timer = useTimerStore();
  const prevRunning = useRef(false);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const controlsRef = useRef<HTMLDivElement>(null);

  const activeCount = Object.values(sounds).filter((s) => s.active).length;

  // Auto-open immersion when timer starts
  useEffect(() => {
    if (timer.isRunning && !prevRunning.current) {
      openImmersion();
    }
    prevRunning.current = timer.isRunning;
  }, [timer.isRunning, openImmersion]);

  // ESC to exit
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") closeImmersion();
    },
    [closeImmersion]
  );

  // Auto-hide controls after inactivity
  useEffect(() => {
    if (!immersionOpen) return;

    const showControls = () => {
      if (controlsRef.current) {
        controlsRef.current.style.opacity = "1";
        controlsRef.current.style.transform = "translateX(-50%) translateY(0)";
      }
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        if (controlsRef.current) {
          controlsRef.current.style.opacity = "0";
          controlsRef.current.style.transform = "translateX(-50%) translateY(20px)";
        }
      }, 4000);
    };

    showControls();
    const onMove = () => showControls();
    document.addEventListener("mousemove", onMove);

    return () => {
      document.removeEventListener("mousemove", onMove);
      clearTimeout(controlsTimeoutRef.current);
    };
  }, [immersionOpen]);

  useEffect(() => {
    if (!immersionOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [immersionOpen, handleKeyDown]);

  if (!immersionOpen) return null;

  const isBreak = timer.phase !== "focus";

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#050508] cursor-default"
      style={{ animation: "immersion-fade-in 0.8s ease-out" }}
    >
      {/* Warp depth particle system */}
      <ImmersiveCanvas />

      {/* Subtle vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(5,5,8,0.7) 100%)",
        }}
      />

      {/* Breathing center pull - concentric rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            width: 400,
            height: 400,
            border: "1px solid rgba(99,102,241,0.06)",
            animation: "pulse-ring-3 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 250,
            height: 250,
            border: "1px solid rgba(99,102,241,0.04)",
            animation: "pulse-ring-2 6s ease-in-out infinite",
            animationDelay: "0.5s",
          }}
        />
      </div>

      {/* Ghost Timer - large centered */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ animation: "ghost-timer-pulse 4s ease-in-out infinite" }}
      >
        <div className="flex flex-col items-center gap-3">
          <span
            className="font-mono font-bold text-text-primary select-none tabular-nums"
            style={{ fontSize: "clamp(72px, 14vw, 180px)", opacity: 0.1 }}
          >
            {formatTime(timer.remaining)}
          </span>
          <span
            className="text-sm font-mono tracking-[6px] uppercase select-none"
            style={{ opacity: 0.08, color: isBreak ? "#22C55E" : "#6366F1" }}
          >
            {timer.phase === "focus"
              ? "Focus Session"
              : timer.phase === "shortBreak"
              ? "Short Break"
              : "Long Break"}
          </span>
        </div>
      </div>

      {/* Top subtle info */}
      {activeCount > 0 && (
        <div
          className="absolute top-6 right-6 flex items-center gap-2 pointer-events-none"
          style={{ animation: "immersion-fade-in 1s ease-out 0.5s both" }}
        >
          <Volume2 className="w-3 h-3 text-text-muted" style={{ opacity: 0.4 }} />
          <span className="text-[10px] font-mono text-text-muted" style={{ opacity: 0.4 }}>
            {activeCount} sound{activeCount > 1 ? "s" : ""} · {masterVolume}%
          </span>
        </div>
      )}

      {/* Floating Control Bar — auto-hides after 4s, reappears on mouse move */}
      <div
        ref={controlsRef}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-full bg-[#0A0A0ACC] border border-[#FFFFFF10] backdrop-blur-2xl"
        style={{
          animation: "controls-slide-up 0.6s ease-out 0.3s both",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <button
          onClick={timer.isRunning ? timer.pauseTimer : timer.startTimer}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-white hover:bg-accent-hover transition-colors cursor-pointer"
        >
          {timer.isRunning ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        <button
          onClick={timer.skipPhase}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-[#FFFFFF06] text-text-secondary hover:bg-[#FFFFFF12] transition-colors cursor-pointer"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-[#FFFFFF10]" />

        <span className="text-sm font-mono text-text-tertiary tabular-nums min-w-[52px] text-center">
          {formatTime(timer.remaining)}
        </span>

        <div className="w-px h-5 bg-[#FFFFFF10]" />

        <button
          onClick={closeImmersion}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-[#FFFFFF06] text-text-tertiary hover:text-text-secondary hover:bg-[#FFFFFF12] transition-colors cursor-pointer"
          title="Exit (ESC)"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      {/* ESC hint - fades out */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ animation: "immersion-fade-in 0.5s ease-out 1s both" }}
      >
        <span className="text-[9px] font-mono text-text-muted" style={{ opacity: 0.3 }}>
          ESC to exit
        </span>
      </div>
    </div>
  );
}
