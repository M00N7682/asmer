import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TimerPhase = "focus" | "shortBreak" | "longBreak";

interface TimerSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLong: number;
  autoVolume: boolean;
}

interface TimerStore {
  phase: TimerPhase;
  remaining: number;
  isRunning: boolean;
  currentSession: number;
  settings: TimerSettings;
  intervalId: ReturnType<typeof setInterval> | null;

  setPhase: (phase: TimerPhase) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipPhase: () => void;
  updateSettings: (settings: Partial<TimerSettings>) => void;
}

function phaseMinutes(phase: TimerPhase, settings: TimerSettings): number {
  switch (phase) {
    case "focus": return settings.focusMinutes;
    case "shortBreak": return settings.shortBreakMinutes;
    case "longBreak": return settings.longBreakMinutes;
  }
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
  phase: "focus",
  remaining: 25 * 60,
  isRunning: false,
  currentSession: 1,
  intervalId: null,
  settings: {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLong: 4,
    autoVolume: true,
  },

  setPhase: (phase) => {
    const state = get();
    if (state.intervalId) clearInterval(state.intervalId);
    set({
      phase,
      remaining: phaseMinutes(phase, state.settings) * 60,
      isRunning: false,
      intervalId: null,
    });
  },

  startTimer: () => {
    const state = get();
    if (state.isRunning) return;
    const id = setInterval(() => {
      const s = get();
      if (s.remaining <= 0) {
        s.skipPhase();
        return;
      }
      set({ remaining: s.remaining - 1 });
    }, 1000);
    set({ isRunning: true, intervalId: id });
  },

  pauseTimer: () => {
    const state = get();
    if (state.intervalId) clearInterval(state.intervalId);
    set({ isRunning: false, intervalId: null });
  },

  resetTimer: () => {
    const state = get();
    if (state.intervalId) clearInterval(state.intervalId);
    set({
      remaining: phaseMinutes(state.phase, state.settings) * 60,
      isRunning: false,
      intervalId: null,
    });
  },

  skipPhase: () => {
    const state = get();
    if (state.intervalId) clearInterval(state.intervalId);
    let nextPhase: TimerPhase;
    let nextSession = state.currentSession;
    if (state.phase === "focus") {
      nextPhase = state.currentSession >= state.settings.sessionsBeforeLong ? "longBreak" : "shortBreak";
    } else {
      nextPhase = "focus";
      if (state.phase === "longBreak") nextSession = 1;
      else nextSession = state.currentSession + 1;
    }
    set({
      phase: nextPhase,
      remaining: phaseMinutes(nextPhase, state.settings) * 60,
      isRunning: false,
      intervalId: null,
      currentSession: nextSession,
    });
  },

  updateSettings: (partial) =>
    set((state) => ({
      settings: { ...state.settings, ...partial },
    })),
    }),
    {
      name: "asmer-timer",
      partialize: (state) => ({
        settings: state.settings,
        currentSession: state.currentSession,
      }),
    }
  )
);
