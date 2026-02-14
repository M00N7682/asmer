import Link from "next/link";

interface SectionHeaderProps {
  label: string;
  title: string;
  actionLabel?: string;
  actionHref?: string;
}

export function SectionHeader({ label, title, actionLabel, actionHref }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold tracking-[2px] text-accent">
          {label}
        </span>
        <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="text-[13px] font-medium text-text-tertiary hover:text-text-secondary transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
