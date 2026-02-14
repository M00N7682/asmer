"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "info" | "warning";

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onDismiss: (id: string) => void;
}

const toastConfig: Record<ToastType, { icon: typeof CheckCircle; color: string; bg: string }> = {
  success: { icon: CheckCircle, color: "text-sound-active", bg: "bg-sound-active/10" },
  info: { icon: Info, color: "text-accent", bg: "bg-accent/10" },
  warning: { icon: AlertTriangle, color: "text-timer-warning", bg: "bg-timer-warning/10" },
};

export function Toast({ id, type, message, onDismiss }: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] border border-border backdrop-blur-md",
        config.bg
      )}
    >
      <Icon className={cn("w-4 h-4 shrink-0", config.color)} />
      <span className="text-sm text-text-primary flex-1">{message}</span>
      <button onClick={() => onDismiss(id)} className="text-text-tertiary hover:text-text-secondary cursor-pointer">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
