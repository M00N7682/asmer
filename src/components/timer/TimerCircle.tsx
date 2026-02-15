"use client";

import { cn } from "@/lib/utils";
import { type TimerPhase } from "@/store/timer-store";

interface TimerCircleProps {
  size?: "sm" | "lg";
  remaining: number;
  total: number;
  phase: TimerPhase;
  session?: number;
  totalSessions?: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function TimerCircle({
  size = "sm",
  remaining,
  total,
  phase,
  session = 1,
  totalSessions = 4,
}: TimerCircleProps) {
  const progress = total > 0 ? remaining / total : 0;
  const isBreak = phase !== "focus";

  const dim = size === "lg" ? 360 : 140;
  const ringSize = size === "lg" ? 340 : 130;
  const strokeWidth = size === "lg" ? 4 : 3;
  const offset = (dim - ringSize) / 2;
  const cx = ringSize / 2;
  const cy = ringSize / 2;
  const r = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - progress);

  const strokeColor = isBreak ? "var(--accent-green-bright)" : "var(--accent)";
  const labelColor = isBreak ? "text-accent-green-bright" : "text-accent";

  const phaseLabel = phase === "focus" ? "FOCUS SESSION" : phase === "shortBreak" ? "SHORT BREAK" : "LONG BREAK";

  return (
    <div className="relative" style={{ width: dim, height: dim }}>
      <svg width={dim} height={dim}>
        {/* Background ring */}
        <circle
          cx={offset + cx}
          cy={offset + cy}
          r={r}
          fill="none"
          stroke="#1C1C22"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={offset + cx}
          cy={offset + cy}
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${offset + cx} ${offset + cy})`}
          className="transition-all duration-1000"
        />
      </svg>
      {/* Inner content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-mono font-bold text-text-primary",
            size === "lg" ? "text-[44px]" : "text-[28px]"
          )}
        >
          {formatTime(remaining)}
        </span>
        <span
          className={cn(
            "font-semibold tracking-[2px]",
            labelColor,
            size === "lg" ? "text-[11px] tracking-[3px]" : "text-[9px]"
          )}
        >
          {size === "lg" ? phaseLabel : phase === "focus" ? "FOCUS" : "BREAK"}
        </span>
        {size === "lg" && (
          <span className="text-[10px] font-mono text-text-muted mt-1">
            Session {session} of {totalSessions}
          </span>
        )}
      </div>
    </div>
  );
}
