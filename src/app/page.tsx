import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import {
  Headphones,
  LayoutGrid,
  SlidersHorizontal,
  Timer,
  Bookmark,
  CloudRain,
  Coffee,
  Flame,
  Play,
  CloudLightning,
  Clock,
  Wind,
  Trees,
  Bird,
  Music,
  Keyboard,
} from "lucide-react";

const features = [
  {
    icon: SlidersHorizontal,
    iconColor: "text-accent",
    iconBg: "bg-[#6366F120]",
    title: "Sound Mixer",
    description:
      "Layer 20+ ambient sounds with individual volume control. Rain, cafe, fireplace, white noise — create your perfect soundscape.",
  },
  {
    icon: Timer,
    iconColor: "text-accent-secondary",
    iconBg: "bg-[#8B5CF620]",
    title: "Pomodoro Timer",
    description:
      "Built-in focus timer with customizable sessions. Auto volume reduction during breaks. Stay in flow without switching apps.",
  },
  {
    icon: Bookmark,
    iconColor: "text-sound-active",
    iconBg: "bg-[#22C55E20]",
    title: "Saved Presets",
    description:
      "Save your favorite sound combinations. Choose from curated presets like Rainy Cafe, Coding Mode, or Deep Night.",
  },
];

const presets = [
  {
    name: "Rainy Cafe",
    desc: "Rain · Cafe · Thunder",
    gradient: "linear-gradient(180deg, #6366F133, #0A0A0A00)",
    icons: [CloudRain, Coffee, CloudLightning],
  },
  {
    name: "Deep Night",
    desc: "Brown Noise · Clock · Wind",
    gradient: "linear-gradient(180deg, #8B5CF633, #0A0A0A00)",
    icons: [Music, Clock, Wind],
  },
  {
    name: "Forest Cabin",
    desc: "Forest · Birds · Campfire",
    gradient: "linear-gradient(180deg, #22C55E25, #0A0A0A00)",
    icons: [Trees, Bird, Flame],
  },
  {
    name: "Coding Mode",
    desc: "Pink Noise · Keyboard · Cafe",
    gradient: "linear-gradient(180deg, #6366F133 0%, #8B5CF620 50%, #0A0A0A00 100%)",
    icons: [Music, Keyboard, Coffee],
  },
];

const soundChips = [
  { icon: CloudRain, label: "Rain", color: "text-sound-active" },
  { icon: Coffee, label: "Cafe", color: "text-sound-active" },
  { icon: Flame, label: "Campfire", color: "text-timer-warning" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[380px] md:h-[520px] overflow-hidden">
        {/* Glow effects */}
        <div className="absolute w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-[radial-gradient(circle,#6366F125,#0A0A0A00)] left-[50%] md:left-[500px] top-[-50px] md:top-[-100px]" />
        <div className="absolute w-[250px] md:w-[500px] h-[250px] md:h-[500px] rounded-full bg-[radial-gradient(circle,#8B5CF620,#0A0A0A00)] left-[60%] md:left-[800px] top-[50px] md:top-[100px]" />
        <div className="absolute w-[200px] md:w-[400px] h-[200px] md:h-[400px] rounded-full bg-[radial-gradient(circle,#22C55E10,#0A0A0A00)] left-[10%] md:left-[200px] top-[100px] md:top-[200px]" />

        <div className="relative z-10 flex flex-col items-center gap-5 md:gap-6 pt-12 md:pt-[80px] px-5 md:px-20 pb-10 md:pb-16 max-w-[1440px] mx-auto">
          {/* Badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-glass-bg border border-border">
            <div className="w-1.5 h-1.5 rounded-full bg-sound-active" />
            <span className="text-[11px] font-medium font-mono text-text-secondary">
              Free. No login required.
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-[64px] font-bold text-text-primary text-center leading-tight">
            Your Space to Focus
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-text-secondary text-center max-w-[560px]">
            Mix ambient sounds, set a pomodoro timer, and find your flow.
          </p>

          {/* CTA buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/mix"
              className="flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold text-sm rounded-[var(--radius-lg)] hover:bg-accent-hover transition-colors"
            >
              <Headphones className="w-4 h-4" />
              Start Mixing
            </Link>
            <Link
              href="/presets"
              className="flex items-center gap-2 px-6 py-3 bg-glass-bg text-text-secondary font-medium text-sm rounded-[var(--radius-lg)] border border-border hover:bg-bg-surface-hover transition-colors"
            >
              <LayoutGrid className="w-4 h-4" />
              Browse Presets
            </Link>
          </div>

          {/* Sound preview chips */}
          <div className="flex items-center gap-3">
            {soundChips.map((chip) => (
              <div
                key={chip.label}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-glass-bg border border-border"
              >
                <chip.icon className={`w-3.5 h-3.5 ${chip.color}`} />
                <span className="text-[10px] font-medium font-mono text-text-secondary">
                  {chip.label}
                </span>
              </div>
            ))}
            <span className="text-[10px] font-mono text-text-muted">+17 more</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="flex flex-col items-center gap-8 md:gap-12 px-5 md:px-20 py-12 md:py-20 max-w-[1440px] mx-auto w-full">
        <div className="flex flex-col items-center gap-1 max-w-[800px]">
          <span className="text-[11px] font-semibold tracking-[2px] text-accent">
            WHY ASMER
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-text-primary">
            Everything You Need to Focus
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-5 p-8 rounded-[var(--radius-xl)] bg-bg-surface border border-border"
            >
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-[var(--radius-lg)] ${f.iconBg}`}
              >
                <f.icon className={`w-6 h-6 ${f.iconColor}`} />
              </div>
              <h3 className="text-xl font-semibold text-text-primary">
                {f.title}
              </h3>
              <p className="text-sm text-text-secondary leading-[1.6]">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Presets Preview Section */}
      <section className="flex flex-col items-center gap-8 md:gap-12 px-5 md:px-20 py-12 md:py-20 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-[2px] text-accent">
              POPULAR PRESETS
            </span>
            <h2 className="text-2xl font-bold text-text-primary">
              Curated Soundscapes
            </h2>
          </div>
          <Link
            href="/presets"
            className="text-[13px] font-medium text-text-tertiary hover:text-text-secondary transition-colors"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full">
          {presets.map((p) => (
            <div
              key={p.name}
              className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-bg-surface overflow-hidden"
            >
              <div
                className="relative h-20 w-full"
                style={{ background: p.gradient }}
              >
                <div className="absolute w-[60px] h-[60px] rounded-full opacity-50 left-5 top-[30px]" style={{ background: "rgba(99,102,241,0.08)" }} />
                <div className="absolute w-20 h-20 rounded-full opacity-40 left-20 top-5" style={{ background: "rgba(99,102,241,0.06)" }} />
              </div>
              <div className="flex flex-col gap-3 px-5 pb-5">
                <h3 className="text-base font-semibold text-text-primary">
                  {p.name}
                </h3>
                <p className="text-[11px] font-mono text-text-tertiary">
                  {p.desc}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {p.icons.map((Icon, i) => (
                      <Icon key={i} className="w-3.5 h-3.5 text-text-muted" />
                    ))}
                  </div>
                  <Link
                    href="/mix"
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-accent rounded-full hover:bg-accent-hover transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    Play
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-5 md:px-20 py-12 md:py-20 max-w-[1440px] mx-auto w-full">
        <div
          className="flex flex-col items-center gap-6 px-6 md:px-12 py-10 md:py-16 rounded-[var(--radius-xl)] border border-border"
          style={{
            background:
              "linear-gradient(135deg, #6366F115 0%, #8B5CF610 50%, #0A0A0A 100%)",
          }}
        >
          <h2 className="text-2xl md:text-4xl font-bold text-text-primary text-center">
            Ready to Find Your Flow?
          </h2>
          <p className="text-sm font-mono text-text-tertiary text-center">
            No signup. No payment. Just press play.
          </p>
          <Link
            href="/mix"
            className="flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold text-base rounded-[var(--radius-lg)] hover:bg-accent-hover transition-colors"
          >
            <Headphones className="w-4 h-4" />
            Start Now →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row items-center justify-between gap-4 px-5 md:px-20 py-6 md:py-8 border-t border-border max-w-[1440px] mx-auto w-full pb-20 md:pb-8">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tracking-[2px] text-text-tertiary">
            ASMER
          </span>
          <div className="w-1 h-1 rounded-full bg-text-muted" />
          <span className="text-[11px] font-mono text-text-muted">
            2025 · Focus sounds for everyone
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="https://github.com" className="text-xs font-medium text-text-tertiary hover:text-text-secondary transition-colors">
            GitHub
          </Link>
          <Link href="/about" className="text-xs font-medium text-text-tertiary hover:text-text-secondary transition-colors">
            About
          </Link>
        </div>
      </footer>
    </div>
  );
}
