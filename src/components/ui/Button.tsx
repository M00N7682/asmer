import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white font-semibold rounded-[var(--radius-lg)] px-6 py-3 gap-2 hover:bg-accent-hover transition-colors",
  secondary:
    "bg-glass-bg text-text-secondary font-medium rounded-[var(--radius-lg)] px-6 py-3 gap-2 border border-border hover:bg-bg-surface-hover transition-colors",
  ghost:
    "text-text-tertiary font-medium rounded-[var(--radius-lg)] px-6 py-3 gap-2 hover:text-text-secondary transition-colors",
  icon:
    "bg-bg-surface text-text-secondary rounded-[var(--radius-md)] p-2.5 border border-border hover:bg-bg-surface-hover transition-colors",
};

export function Button({
  variant = "primary",
  icon: Icon,
  iconPosition = "left",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center text-sm cursor-pointer",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon className="w-4 h-4" />}
      {children}
      {Icon && iconPosition === "right" && <Icon className="w-4 h-4" />}
    </button>
  );
}
