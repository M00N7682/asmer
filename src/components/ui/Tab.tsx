import { cn } from "@/lib/utils";

interface TabProps {
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}

export function Tab({ label, count, active = false, onClick }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-colors cursor-pointer",
        active
          ? "bg-accent text-white font-semibold"
          : "bg-glass-bg text-text-secondary border border-border hover:bg-bg-surface-hover"
      )}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "font-mono text-[11px] font-semibold",
            active ? "text-white/70" : "text-text-muted"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
