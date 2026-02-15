import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AnimationType =
  | "none"
  | "orbs"
  | "fireflies"
  | "aurora"
  | "pulse"
  | "immersion";

interface AnimationStore {
  activeAnimation: AnimationType;
  intensity: number;
  immersionOpen: boolean;
  setAnimation: (type: AnimationType) => void;
  setIntensity: (v: number) => void;
  openImmersion: () => void;
  closeImmersion: () => void;
}

export const useAnimationStore = create<AnimationStore>()(
  persist(
    (set) => ({
      activeAnimation: "none",
      intensity: 70,
      immersionOpen: false,

      setAnimation: (type) => set({ activeAnimation: type }),
      setIntensity: (v) => set({ intensity: v }),
      openImmersion: () => set({ immersionOpen: true }),
      closeImmersion: () => set({ immersionOpen: false }),
    }),
    {
      name: "asmer-animation",
      partialize: (state) => ({
        activeAnimation: state.activeAnimation,
        intensity: state.intensity,
      }),
    }
  )
);
