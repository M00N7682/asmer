import {
  CloudRain, Wind, Waves, Zap, Coffee, Bird, Flame,
  Monitor, TrainFront, Moon, Trees, Code, Music,
  Droplets, CloudLightning, Volume2, Radio, Ear,
  Shirt, Clock, Anchor, Mountain, Snowflake, Cloudy,
  Leaf, Sailboat, Cat, Tent,
  Piano, Headphones, Pen, Book, Heart,
  Sparkles, Fan, Thermometer, Wifi,
  Bug, Shell, Fish, Umbrella, CloudDrizzle, CloudSnow,
  Sunset, MoonStar, Star,
  Car, Building2, Utensils, Mic, Bell,
  Drum, Brush, Feather, CircleDot, Activity,
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
  // Nature (20)
  { id: "rain", name: "Rain", category: "Nature", icon: CloudRain },
  { id: "heavy-rain", name: "Heavy Rain", category: "Nature", icon: CloudLightning },
  { id: "drizzle", name: "Light Drizzle", category: "Nature", icon: CloudDrizzle },
  { id: "rain-on-tent", name: "Rain on Tent", category: "Nature", icon: Tent },
  { id: "rain-on-window", name: "Rain on Window", category: "Nature", icon: Umbrella },
  { id: "wind", name: "Wind", category: "Nature", icon: Wind },
  { id: "waves", name: "Ocean Waves", category: "Nature", icon: Waves },
  { id: "thunder", name: "Thunder", category: "Nature", icon: Zap },
  { id: "birds", name: "Birds", category: "Nature", icon: Bird },
  { id: "campfire", name: "Campfire", category: "Nature", icon: Flame },
  { id: "forest", name: "Forest", category: "Nature", icon: Trees },
  { id: "creek", name: "Creek", category: "Nature", icon: Droplets },
  { id: "river", name: "River", category: "Nature", icon: Sailboat },
  { id: "waterfall", name: "Waterfall", category: "Nature", icon: Mountain },
  { id: "leaves", name: "Rustling Leaves", category: "Nature", icon: Leaf },
  { id: "snow", name: "Snowfall", category: "Nature", icon: Snowflake },
  { id: "underwater", name: "Underwater", category: "Nature", icon: Anchor },
  { id: "crickets", name: "Crickets", category: "Nature", icon: Bug },
  { id: "frogs", name: "Frogs", category: "Nature", icon: Shell },
  { id: "whale", name: "Whale Song", category: "Nature", icon: Fish },

  // Urban (12)
  { id: "cafe", name: "Cafe", category: "Urban", icon: Coffee },
  { id: "keyboard", name: "Keyboard", category: "Urban", icon: Monitor },
  { id: "train", name: "Train", category: "Urban", icon: TrainFront },
  { id: "clock", name: "Clock", category: "Urban", icon: Clock },
  { id: "city", name: "City Traffic", category: "Urban", icon: Radio },
  { id: "library", name: "Library", category: "Urban", icon: Book },
  { id: "airplane", name: "Airplane Cabin", category: "Urban", icon: Cloudy },
  { id: "vinyl", name: "Vinyl Crackle", category: "Urban", icon: Music },
  { id: "restaurant", name: "Restaurant", category: "Urban", icon: Utensils },
  { id: "subway", name: "Subway", category: "Urban", icon: Building2 },
  { id: "car-ride", name: "Car Ride", category: "Urban", icon: Car },
  { id: "playground", name: "Playground", category: "Urban", icon: Star },

  // Noise (8)
  { id: "white-noise", name: "White Noise", category: "Noise", icon: Volume2 },
  { id: "pink-noise", name: "Pink Noise", category: "Noise", icon: Wifi },
  { id: "brown-noise", name: "Brown Noise", category: "Noise", icon: Moon },
  { id: "fan", name: "Fan Hum", category: "Noise", icon: Fan },
  { id: "static", name: "Static", category: "Noise", icon: Sparkles },
  { id: "ac", name: "Air Conditioner", category: "Noise", icon: Thermometer },
  { id: "dryer", name: "Clothes Dryer", category: "Noise", icon: CircleDot },
  { id: "binaural", name: "Binaural Beats", category: "Noise", icon: Activity },

  // ASMR (12)
  { id: "asmr-typing", name: "Typing", category: "ASMR", icon: Code },
  { id: "asmr-whisper", name: "Whisper", category: "ASMR", icon: Ear },
  { id: "asmr-fabric", name: "Fabric", category: "ASMR", icon: Shirt },
  { id: "asmr-purring", name: "Cat Purring", category: "ASMR", icon: Cat },
  { id: "asmr-writing", name: "Pen Writing", category: "ASMR", icon: Pen },
  { id: "asmr-heartbeat", name: "Heartbeat", category: "ASMR", icon: Heart },
  { id: "asmr-piano", name: "Soft Piano", category: "ASMR", icon: Piano },
  { id: "asmr-singing-bowl", name: "Singing Bowl", category: "ASMR", icon: Headphones },
  { id: "asmr-page-turn", name: "Page Turning", category: "ASMR", icon: Book },
  { id: "asmr-brushing", name: "Hair Brushing", category: "ASMR", icon: Brush },
  { id: "asmr-chimes", name: "Wind Chimes", category: "ASMR", icon: Bell },
  { id: "asmr-humming", name: "Humming", category: "ASMR", icon: Mic },
];

export const categories: { label: SoundCategory; count: number }[] = [
  { label: "All", count: sounds.length },
  { label: "Nature", count: sounds.filter((s) => s.category === "Nature").length },
  { label: "Urban", count: sounds.filter((s) => s.category === "Urban").length },
  { label: "Noise", count: sounds.filter((s) => s.category === "Noise").length },
  { label: "ASMR", count: sounds.filter((s) => s.category === "ASMR").length },
];
