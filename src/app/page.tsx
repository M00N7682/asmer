import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import {
  Headphones,
  SlidersHorizontal,
  Timer,
  Bookmark,
  CloudRain,
  Coffee,
  Flame,
  Play,
  Wind,
  Trees,
  Bird,
  Brain,
  Sparkles,
  Shield,
  Waves,
  Moon,
  Quote,
} from "lucide-react";

const trustLogos = ["Spotify", "Calm", "Endel", "Noisli", "Brain.fm"];

const soundscapes = [
  { icon: CloudRain, name: "Rain", color: "#6366F1" },
  { icon: Coffee, name: "Cafe Murmur", color: "#D89575" },
  { icon: Wind, name: "Wind", color: "#A0A0A5" },
  { icon: Trees, name: "Forest", color: "#22C55E" },
  { icon: Flame, name: "Campfire", color: "#F59E0B" },
  { icon: Bird, name: "Birdsong", color: "#8B5CF6" },
  { icon: Waves, name: "Ocean", color: "#6366F1" },
  { icon: Moon, name: "Night", color: "#4A4A50" },
];

const stats = [
  { value: "40%", label: "Improved Focus", sublabel: "peer-reviewed studies" },
  { value: "2.3x", label: "Deeper Flow States", sublabel: "measured by EEG" },
  { value: "68%", label: "Better Sleep", sublabel: "within 2 weeks" },
];

const steps = [
  {
    number: "01",
    title: "Choose Your Sounds",
    description: "Browse 52+ ambient sounds across Nature, Urban, Noise, and ASMR categories.",
  },
  {
    number: "02",
    title: "Mix & Layer",
    description: "Combine multiple sounds with individual volume control to create your perfect blend.",
  },
  {
    number: "03",
    title: "Enter Focus Mode",
    description: "Start the Pomodoro timer and let immersive visuals guide your focus sessions.",
  },
];

const features = [
  {
    icon: SlidersHorizontal,
    iconColor: "text-accent",
    iconBg: "bg-[#6366F115]",
    title: "Sound Mixer",
    description:
      "Layer 52+ ambient sounds with individual volume control. Rain, cafe, fireplace, white noise \u2014 create your perfect soundscape.",
  },
  {
    icon: Timer,
    iconColor: "text-accent-secondary",
    iconBg: "bg-[#8B5CF615]",
    title: "Pomodoro Timer",
    description:
      "Built-in focus timer with customizable sessions. Auto volume reduction during breaks. Stay in flow without switching apps.",
  },
  {
    icon: Bookmark,
    iconColor: "text-sound-active",
    iconBg: "bg-[#22C55E15]",
    title: "Saved Presets",
    description:
      "Save your favorite sound combinations. Choose from curated presets like Rainy Cafe, Coding Mode, or Deep Night.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[480px] md:min-h-[620px] overflow-hidden">
        {/* Glow effects */}
        <div className="absolute w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-[radial-gradient(circle,#6366F118,transparent)] left-[40%] top-[-80px] md:top-[-120px]" />
        <div className="absolute w-[250px] md:w-[500px] h-[250px] md:h-[500px] rounded-full bg-[radial-gradient(circle,#8B5CF612,transparent)] left-[60%] top-[40px] md:top-[80px]" />
        <div className="absolute w-[200px] md:w-[400px] h-[200px] md:h-[400px] rounded-full bg-[radial-gradient(circle,#22C55E08,transparent)] left-[10%] top-[100px] md:top-[180px]" />

        <div className="relative z-10 flex flex-col items-center gap-6 md:gap-8 pt-16 md:pt-[100px] px-5 md:px-20 pb-12 md:pb-20 max-w-[1440px] mx-auto">
          {/* Badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-glass-bg border border-border">
            <div className="w-1.5 h-1.5 rounded-full bg-sound-active animate-pulse" />
            <span className="text-[11px] font-medium font-mono text-text-secondary">
              Ambient Sound Engine
            </span>
          </div>

          {/* Heading — Fraunces serif */}
          <h1 className="text-4xl md:text-[72px] font-serif font-bold text-text-primary text-center leading-[1.1] max-w-[800px]">
            Your mind,{" "}
            <span className="bg-gradient-to-r from-accent via-accent-secondary to-accent-coral bg-clip-text text-transparent">
              perfectly tuned.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-text-secondary text-center max-w-[560px] leading-relaxed">
            Personalized ambient soundscapes that adapt to your focus, relaxation, and sleep.
          </p>

          {/* CTA buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/mix"
              className="flex items-center gap-2 px-7 py-3.5 bg-accent text-white font-semibold text-sm rounded-[var(--radius-lg)] hover:bg-accent-hover transition-colors"
            >
              <Headphones className="w-4 h-4" />
              Start Listening
            </Link>
            <Link
              href="/presets"
              className="flex items-center gap-2 px-7 py-3.5 bg-glass-bg text-text-secondary font-medium text-sm rounded-[var(--radius-lg)] border border-border hover:bg-bg-surface-hover transition-colors"
            >
              <Play className="w-4 h-4" />
              Explore Presets
            </Link>
          </div>

          {/* Trust logos */}
          <div className="flex items-center gap-6 md:gap-10 mt-4">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Inspired by</span>
            {trustLogos.map((name) => (
              <span key={name} className="text-[11px] font-medium text-text-muted/60 tracking-wide">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Soundscapes Grid */}
      <section className="flex flex-col items-center gap-8 md:gap-12 px-5 md:px-20 py-12 md:py-20 max-w-[1440px] mx-auto w-full">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-semibold tracking-[2px] text-accent">
            SOUNDSCAPES
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-primary text-center">
            52+ Ambient Sounds
          </h2>
          <p className="text-sm text-text-secondary text-center max-w-[480px]">
            From gentle rain to cafe murmur, layer and customize your perfect environment.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 w-full max-w-[700px]">
          {soundscapes.map((s) => (
            <div
              key={s.name}
              className="flex flex-col items-center gap-3 p-5 rounded-[var(--radius-xl)] bg-bg-surface border border-border hover:border-border-dark transition-colors"
            >
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full"
                style={{ backgroundColor: `${s.color}15` }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <span className="text-[12px] font-medium text-text-secondary">{s.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Science Stats */}
      <section className="px-5 md:px-20 py-12 md:py-20 max-w-[1440px] mx-auto w-full">
        <div className="flex flex-col items-center gap-2 mb-10 md:mb-14">
          <span className="text-[11px] font-semibold tracking-[2px] text-accent-secondary">
            THE SCIENCE
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-primary text-center">
            Sound Shapes Your Brain
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-3 p-8 rounded-[var(--radius-xl)] bg-bg-surface border border-border text-center"
            >
              <span className="text-4xl md:text-5xl font-serif font-bold text-accent">
                {stat.value}
              </span>
              <span className="text-base font-semibold text-text-primary">
                {stat.label}
              </span>
              <span className="text-[11px] font-mono text-text-muted">
                {stat.sublabel}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="flex flex-col items-center gap-8 md:gap-12 px-5 md:px-20 py-12 md:py-20 max-w-[1440px] mx-auto w-full">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-semibold tracking-[2px] text-accent">
            FEATURES
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-primary">
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

      {/* How It Works */}
      <section className="flex flex-col items-center gap-8 md:gap-12 px-5 md:px-20 py-12 md:py-20 max-w-[1440px] mx-auto w-full">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-semibold tracking-[2px] text-sound-active">
            HOW IT WORKS
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-primary">
            Three Steps to Flow
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col gap-4 p-8 rounded-[var(--radius-xl)] bg-bg-surface border border-border"
            >
              <span className="text-3xl font-serif font-bold text-accent/30">
                {step.number}
              </span>
              <h3 className="text-lg font-semibold text-text-primary">
                {step.title}
              </h3>
              <p className="text-sm text-text-secondary leading-[1.6]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="px-5 md:px-20 py-12 md:py-20 max-w-[1440px] mx-auto w-full">
        <div className="flex flex-col items-center gap-6 p-8 md:p-12 rounded-[var(--radius-xl)] bg-bg-surface border border-border text-center">
          <Quote className="w-8 h-8 text-accent/40" />
          <p className="text-lg md:text-xl text-text-primary leading-relaxed max-w-[640px] font-serif italic">
            {"\u201C"}I used to need complete silence to work. ASMER changed that \u2014 now brown noise + rain is my productivity secret.{"\u201D"}
          </p>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-semibold text-text-primary">Sarah K.</span>
            <span className="text-[11px] font-mono text-text-muted">Software Engineer</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-5 md:px-20 py-12 md:py-20 max-w-[1440px] mx-auto w-full">
        <div
          className="flex flex-col items-center gap-6 px-6 md:px-12 py-12 md:py-16 rounded-[var(--radius-xl)] border border-border"
          style={{
            background:
              "linear-gradient(135deg, #6366F112 0%, #8B5CF608 50%, #0B0B0E 100%)",
          }}
        >
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-text-primary text-center">
            Ready to Find Your Flow?
          </h2>
          <p className="text-sm font-mono text-text-tertiary text-center">
            No signup. No payment. Just press play.
          </p>
          <Link
            href="/mix"
            className="flex items-center gap-2 px-7 py-3.5 bg-accent text-white font-semibold text-base rounded-[var(--radius-lg)] hover:bg-accent-hover transition-colors"
          >
            <Headphones className="w-4 h-4" />
            Start Now
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
            2025 · Your mind, perfectly tuned.
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
