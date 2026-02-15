// GA4 event tracking utility
// Set NEXT_PUBLIC_GA_ID in environment to enable

type GTagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export function trackEvent({ action, category, label, value }: GTagEvent) {
  if (!window.gtag) return;
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
}

// -- Sound events --

export function trackSoundToggle(soundId: string, active: boolean) {
  trackEvent({
    action: active ? "sound_play" : "sound_stop",
    category: "sound",
    label: soundId,
  });
}

export function trackVolumeChange(soundId: string, volume: number) {
  trackEvent({
    action: "volume_change",
    category: "sound",
    label: soundId,
    value: Math.round(volume),
  });
}

export function trackMasterVolume(volume: number) {
  trackEvent({
    action: "master_volume_change",
    category: "sound",
    value: Math.round(volume),
  });
}

// -- Preset events --

export function trackPresetApply(presetName: string) {
  trackEvent({
    action: "preset_apply",
    category: "preset",
    label: presetName,
  });
}

export function trackPresetSave(presetName: string) {
  trackEvent({
    action: "preset_save",
    category: "preset",
    label: presetName,
  });
}

// -- Timer events --

export function trackTimerStart(phase: string, minutes: number) {
  trackEvent({
    action: "timer_start",
    category: "timer",
    label: phase,
    value: minutes,
  });
}

export function trackTimerPause(phase: string, remainingSeconds: number) {
  trackEvent({
    action: "timer_pause",
    category: "timer",
    label: phase,
    value: remainingSeconds,
  });
}

export function trackTimerReset(phase: string) {
  trackEvent({
    action: "timer_reset",
    category: "timer",
    label: phase,
  });
}

export function trackTimerSkip(fromPhase: string, toPhase: string) {
  trackEvent({
    action: "timer_skip",
    category: "timer",
    label: `${fromPhase} → ${toPhase}`,
  });
}

// -- Navigation events --

export function trackCTAClick(label: string) {
  trackEvent({
    action: "cta_click",
    category: "navigation",
    label,
  });
}

export function trackImmersionOpen() {
  trackEvent({
    action: "immersion_open",
    category: "feature",
  });
}
