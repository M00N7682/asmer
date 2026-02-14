"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { useAudioStore } from "@/store/audio-store";
import { sounds as soundList } from "@/audio/sounds";

interface PresetSaveModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export function PresetSaveModal({ open, onClose, onSave }: PresetSaveModalProps) {
  const [name, setName] = useState("");
  const audioStore = useAudioStore();

  if (!open) return null;

  const activeSounds = Object.entries(audioStore.sounds)
    .filter(([, s]) => s.active)
    .map(([id]) => soundList.find((m) => m.id === id))
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col gap-5 w-[400px] p-6 rounded-[var(--radius-xl)] bg-bg-surface border border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">Save Preset</h3>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-secondary cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <input
          type="text"
          placeholder="Preset name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 text-sm bg-bg-primary border border-border rounded-[var(--radius-md)] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-[1px] text-text-tertiary">
            SOUNDS ({activeSounds.length})
          </span>
          {activeSounds.map((s) => s && (
            <div key={s.id} className="flex items-center gap-2">
              <s.icon className="w-4 h-4 text-sound-active" />
              <span className="text-sm text-text-primary">{s.name}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            if (name.trim()) {
              onSave(name.trim());
              onClose();
            }
          }}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-accent text-white text-sm font-semibold rounded-[var(--radius-lg)] hover:bg-accent-hover transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Save Preset
        </button>
      </div>
    </div>
  );
}
