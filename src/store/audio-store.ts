import { create } from "zustand";
import { persist } from "zustand/middleware";
import { audioEngine } from "@/audio/engine";

interface SoundState {
  volume: number;
  active: boolean;
}

interface AudioStore {
  sounds: Record<string, SoundState>;
  masterVolume: number;
  toggleSound: (id: string) => void;
  setVolume: (id: string, volume: number) => void;
  setMasterVolume: (volume: number) => void;
  applyPreset: (soundIds: string[]) => void;
  activeSoundIds: () => string[];
  syncEngine: () => void;
}

export const useAudioStore = create<AudioStore>()(
  persist(
    (set, get) => ({
      sounds: {},
      masterVolume: 72,

      toggleSound: (id) => {
        set((state) => {
          const current = state.sounds[id] || { volume: 70, active: false };
          const newActive = !current.active;
          if (newActive) {
            audioEngine.playSound(id, current.volume);
          } else {
            audioEngine.stopSound(id);
          }
          return {
            sounds: {
              ...state.sounds,
              [id]: { ...current, active: newActive },
            },
          };
        });
      },

      setVolume: (id, volume) => {
        set((state) => {
          const current = state.sounds[id] || { volume: 70, active: true };
          audioEngine.setSoundVolume(id, volume);
          return {
            sounds: {
              ...state.sounds,
              [id]: { ...current, volume },
            },
          };
        });
      },

      setMasterVolume: (volume) => {
        audioEngine.setMasterVolume(volume);
        set({ masterVolume: volume });
      },

      applyPreset: (soundIds) => {
        const state = get();
        // Stop all currently active sounds
        for (const [id, s] of Object.entries(state.sounds)) {
          if (s.active) audioEngine.stopSound(id);
        }
        // Build new state
        const newSounds: Record<string, SoundState> = {};
        for (const [id, s] of Object.entries(state.sounds)) {
          newSounds[id] = { ...s, active: false };
        }
        for (const id of soundIds) {
          const vol = newSounds[id]?.volume ?? 70;
          newSounds[id] = { volume: vol, active: true };
          audioEngine.playSound(id, vol);
        }
        set({ sounds: newSounds });
      },

      activeSoundIds: () =>
        Object.entries(get().sounds)
          .filter(([, s]) => s.active)
          .map(([id]) => id),

      syncEngine: () => {
        const state = get();
        audioEngine.setMasterVolume(state.masterVolume);
        for (const [id, s] of Object.entries(state.sounds)) {
          if (s.active) {
            audioEngine.playSound(id, s.volume);
          }
        }
      },
    }),
    {
      name: "asmer-audio",
      partialize: (state) => ({
        sounds: state.sounds,
        masterVolume: state.masterVolume,
      }),
    }
  )
);
