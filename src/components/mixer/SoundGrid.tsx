"use client";

import { SoundTile } from "./SoundTile";
import { sounds, type SoundCategory } from "@/audio/sounds";
import { useAudioStore } from "@/store/audio-store";

interface SoundGridProps {
  category: SoundCategory;
}

export function SoundGrid({ category }: SoundGridProps) {
  const { sounds: soundStates, toggleSound, setVolume } = useAudioStore();

  const filtered = category === "All" ? sounds : sounds.filter((s) => s.category === category);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
      {filtered.map((sound) => {
        const state = soundStates[sound.id];
        return (
          <SoundTile
            key={sound.id}
            name={sound.name}
            icon={sound.icon}
            active={state?.active ?? false}
            volume={state?.volume ?? 70}
            onToggle={() => toggleSound(sound.id)}
            onVolumeChange={(v) => setVolume(sound.id, v)}
          />
        );
      })}
    </div>
  );
}
