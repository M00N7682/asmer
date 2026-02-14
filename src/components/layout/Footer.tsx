import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="flex items-center justify-between px-20 py-8 border-t border-border">
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold tracking-[2px] text-text-primary">
          ASMER
        </span>
        <span className="text-xs text-text-tertiary">&copy; 2025</span>
      </div>
      <div className="flex items-center gap-6">
        <Link href="/about" className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">
          About
        </Link>
        <Link href="https://github.com" className="text-text-tertiary hover:text-text-secondary transition-colors">
          <Github className="w-4 h-4" />
        </Link>
      </div>
    </footer>
  );
}
