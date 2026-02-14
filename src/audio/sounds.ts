import {
  CloudRain, Wind, Waves, Zap, Coffee, Bird, Flame,
  Monitor, TrainFront, Moon, Trees, Code, Music,
  Droplets, CloudLightning, Volume2, Radio, Ear,
  Shirt, Clock,
  type LucideIcon,
} from "lucide-react";

export type SoundCategory = "All" | "Nature" | "Urban" | "Noise" | "ASMR";

export interface SoundMeta {
  id: string;
  name: string;
  category: SoundCategory;
  icon: LucideIcon;
}

export const sounds: SoundMeta[] = [
  { id: "rain", name: "Rain", category: "Nature", icon: CloudRain },
  { id: "wind", name: "Wind", category: "Nature", icon: Wind },
  { id: "waves", name: "Waves", category: "Nature", icon: Waves },
  { id: "thunder", name: "Thunder", category: "Nature", icon: Zap },
  { id: "birds", name: "Birds", category: "Nature", icon: Bird },
  { id: "campfire", name: "Campfire", category: "Nature", icon: Flame },
  { id: "forest", name: "Forest", category: "Nature", icon: Trees },
  { id: "creek", name: "Creek", category: "Nature", icon: Droplets },
  { id: "cafe", name: "Cafe", category: "Urban", icon: Coffee },
  { id: "keyboard", name: "Keyboard", category: "Urban", icon: Monitor },
  { id: "train", name: "Train", category: "Urban", icon: TrainFront },
  { id: "clock", name: "Clock", category: "Urban", icon: Clock },
  { id: "city", name: "City", category: "Urban", icon: Radio },
  { id: "white-noise", name: "White Noise", category: "Noise", icon: Volume2 },
  { id: "pink-noise", name: "Pink Noise", category: "Noise", icon: Music },
  { id: "brown-noise", name: "Brown Noise", category: "Noise", icon: Moon },
  { id: "asmr-typing", name: "Typing", category: "ASMR", icon: Code },
  { id: "asmr-whisper", name: "Whisper", category: "ASMR", icon: Ear },
  { id: "asmr-fabric", name: "Fabric", category: "ASMR", icon: Shirt },
  { id: "asmr-storm", name: "Storm", category: "ASMR", icon: CloudLightning },
];

export const categories: { label: SoundCategory; count: number }[] = [
  { label: "All", count: sounds.length },
  { label: "Nature", count: sounds.filter((s) => s.category === "Nature").length },
  { label: "Urban", count: sounds.filter((s) => s.category === "Urban").length },
  { label: "Noise", count: sounds.filter((s) => s.category === "Noise").length },
  { label: "ASMR", count: sounds.filter((s) => s.category === "ASMR").length },
];
