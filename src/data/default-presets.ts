import {
  CloudRain, Coffee, CloudLightning, Moon, Clock, Wind,
  Trees, Bird, Flame, Music, Keyboard, BookOpen,
  TrainFront, Waves, type LucideIcon,
} from "lucide-react";

export interface Preset {
  id: string;
  name: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  soundIds: string[];
  icons: LucideIcon[];
}

export const defaultPresets: Preset[] = [
  {
    id: "rainy-cafe",
    name: "Rainy Cafe",
    description: "Rain · Cafe · Thunder",
    gradientFrom: "#6366F133",
    gradientTo: "#0B0B0E00",
    soundIds: ["rain", "cafe", "thunder"],
    icons: [CloudRain, Coffee, CloudLightning],
  },
  {
    id: "deep-night",
    name: "Deep Night",
    description: "Brown Noise · Clock · Wind",
    gradientFrom: "#8B5CF633",
    gradientTo: "#0B0B0E00",
    soundIds: ["brown-noise", "clock", "wind"],
    icons: [Moon, Clock, Wind],
  },
  {
    id: "forest-cabin",
    name: "Forest Cabin",
    description: "Forest · Birds · Campfire",
    gradientFrom: "#22C55E25",
    gradientTo: "#0B0B0E00",
    soundIds: ["forest", "birds", "campfire"],
    icons: [Trees, Bird, Flame],
  },
  {
    id: "library",
    name: "Library",
    description: "Library · Paper · Pencil",
    gradientFrom: "#F59E0B20",
    gradientTo: "#0B0B0E00",
    soundIds: ["clock", "keyboard"],
    icons: [BookOpen, Clock, Keyboard],
  },
  {
    id: "coding-mode",
    name: "Coding Mode",
    description: "Pink Noise · Keyboard · Cafe",
    gradientFrom: "#6366F133",
    gradientTo: "#0B0B0E00",
    soundIds: ["pink-noise", "keyboard", "cafe"],
    icons: [Music, Keyboard, Coffee],
  },
  {
    id: "train-journey",
    name: "Train Journey",
    description: "Train · Rain · Wind",
    gradientFrom: "#94A3B820",
    gradientTo: "#0B0B0E00",
    soundIds: ["train", "rain", "wind"],
    icons: [TrainFront, CloudRain, Wind],
  },
  {
    id: "lofi-room",
    name: "Lo-fi Room",
    description: "Brown Noise · Cat · Clock · Rain",
    gradientFrom: "#EC489920",
    gradientTo: "#0B0B0E00",
    soundIds: ["brown-noise", "clock", "rain"],
    icons: [Music, Clock, CloudRain],
  },
  {
    id: "beach",
    name: "Beach",
    description: "Waves · Wind · Birds",
    gradientFrom: "#06B6D420",
    gradientTo: "#0B0B0E00",
    soundIds: ["waves", "wind", "birds"],
    icons: [Waves, Wind, Bird],
  },
];
