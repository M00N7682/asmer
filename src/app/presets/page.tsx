"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { PresetSaveModal } from "@/components/presets/PresetSaveModal";
import { defaultPresets } from "@/data/default-presets";
import { useAudioStore } from "@/store/audio-store";
import { Search, Plus, Play, Bookmark } from "lucide-react";

export default function PresetsPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const audioStore = useAudioStore();

  const filtered = defaultPresets.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />

      <div className="flex flex-col gap-8 md:gap-12 px-4 md:px-20 py-6 md:py-8 pb-20 md:pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-[2px] text-accent">
              PRESET GALLERY
            </span>
            <h1 className="text-[28px] font-bold text-text-primary">
              Soundscapes for Every Mood
            </h1>
            <p className="text-sm text-text-secondary">
              Curated sound combinations to help you focus, relax, or work.
            </p>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-[var(--radius-lg)] bg-bg-surface border border-border w-full md:w-[280px]">
            <Search className="w-4 h-4 text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search presets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Default Presets */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">
              Default Presets
            </h2>
            <span className="text-[11px] font-mono text-text-muted">
              {filtered.length} presets
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {filtered.map((preset) => (
              <div
                key={preset.id}
                className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-bg-surface overflow-hidden"
              >
                <div
                  className="relative h-20 w-full"
                  style={{
                    background: `linear-gradient(180deg, ${preset.gradientFrom}, ${preset.gradientTo})`,
                  }}
                >
                  <div className="absolute w-[60px] h-[60px] rounded-full opacity-50 left-5 top-[30px]" style={{ background: "rgba(99,102,241,0.08)" }} />
                  <div className="absolute w-20 h-20 rounded-full opacity-40 left-20 top-5" style={{ background: "rgba(99,102,241,0.06)" }} />
                </div>
                <div className="flex flex-col gap-3 px-5 pb-5">
                  <h3 className="text-base font-semibold text-text-primary">
                    {preset.name}
                  </h3>
                  <p className="text-[11px] font-mono text-text-tertiary">
                    {preset.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {preset.icons.map((Icon, i) => (
                        <Icon key={i} className="w-3.5 h-3.5 text-text-muted" />
                      ))}
                    </div>
                    <button
                      onClick={() => audioStore.applyPreset(preset.soundIds)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-accent rounded-full hover:bg-accent-hover transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      Play
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Saved Presets */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">
              My Saved Presets
            </h2>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-glass-bg border border-border text-accent text-xs font-medium hover:bg-bg-surface-hover transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Preset
            </button>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center gap-4 py-12 px-8 rounded-[var(--radius-xl)] bg-bg-surface border border-border">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#6366F115]">
              <Bookmark className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">
              No saved presets yet
            </h3>
            <p className="text-[13px] text-text-tertiary text-center max-w-[400px]">
              Create your own sound combinations in the Mixer and save them here.
            </p>
            <Link
              href="/mix"
              className="flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold text-sm rounded-[var(--radius-lg)] hover:bg-accent-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Preset
            </Link>
          </div>
        </div>
      </div>

      <PresetSaveModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(name) => {
          console.log("Saved preset:", name);
        }}
      />
    </div>
  );
}
