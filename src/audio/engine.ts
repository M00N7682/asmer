"use client";

import { createNoiseBuffer, type NoiseType } from "./noise-generator";
import { createProceduralSound, hasProceduralSound, type ProceduralSound } from "./procedural-sounds";

/**
 * AudioEngine manages Web Audio API graph:
 * Source → GainNode (per-sound) → MasterGainNode → Destination
 *
 * Sound types:
 * 1. Basic noise (white/pink/brown) — simple looped buffer
 * 2. Procedural sounds (rain, wind, cafe, etc.) — synthesized in real-time
 */

interface SoundNode {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

interface ProceduralNode {
  procedural: ProceduralSound;
  gain: GainNode;
}

type ActiveSound = SoundNode | ProceduralNode;

function isProcedural(node: ActiveSound): node is ProceduralNode {
  return "procedural" in node;
}

// Map sound IDs to noise types
const noiseMap: Record<string, NoiseType> = {
  "white-noise": "white",
  "pink-noise": "pink",
  "brown-noise": "brown",
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeSounds: Map<string, ActiveSound> = new Map();
  private noiseBuffers: Map<NoiseType, AudioBuffer> = new Map();

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private getMasterGain(): GainNode {
    this.getContext();
    return this.masterGain!;
  }

  setMasterVolume(volume: number) {
    const gain = this.getMasterGain();
    gain.gain.setTargetAtTime(volume / 100, gain.context.currentTime, 0.05);
  }

  playSound(id: string, volume: number) {
    // Stop existing if playing
    this.stopSound(id);

    const ctx = this.getContext();
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume / 100;
    gainNode.connect(this.getMasterGain());

    const noiseType = noiseMap[id];

    if (noiseType) {
      // Basic noise: simple looped buffer
      if (!this.noiseBuffers.has(noiseType)) {
        this.noiseBuffers.set(noiseType, createNoiseBuffer(ctx, noiseType));
      }
      const source = ctx.createBufferSource();
      source.buffer = this.noiseBuffers.get(noiseType)!;
      source.loop = true;
      source.connect(gainNode);
      source.start();
      this.activeSounds.set(id, { source, gain: gainNode });
    } else if (hasProceduralSound(id)) {
      // Procedural: synthesized ambient sound
      const procedural = createProceduralSound(ctx, id)!;
      procedural.output.connect(gainNode);
      this.activeSounds.set(id, { procedural, gain: gainNode });
    }
  }

  stopSound(id: string) {
    const node = this.activeSounds.get(id);
    if (!node) return;

    if (isProcedural(node)) {
      node.procedural.stop();
    } else {
      try { node.source.stop(); } catch { /* already stopped */ }
      node.source.disconnect();
    }
    node.gain.disconnect();
    this.activeSounds.delete(id);
  }

  setSoundVolume(id: string, volume: number) {
    const node = this.activeSounds.get(id);
    if (!node) return;
    node.gain.gain.setTargetAtTime(volume / 100, node.gain.context.currentTime, 0.05);
  }

  stopAll() {
    for (const id of this.activeSounds.keys()) {
      this.stopSound(id);
    }
  }

  isPlaying(id: string): boolean {
    return this.activeSounds.has(id);
  }
}

// Singleton
export const audioEngine = new AudioEngine();
