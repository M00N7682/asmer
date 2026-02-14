"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/mix", label: "Mix" },
  { href: "/timer", label: "Timer" },
  { href: "/presets", label: "Presets" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between h-14 md:h-16 px-4 md:px-8 bg-[#0A0A0ACC] backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="flex items-center gap-4 md:gap-8">
        <Link href="/" className="text-lg md:text-xl font-bold tracking-[3px] text-text-primary">
          ASMER
        </Link>
        <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-accent" />
        <div className="hidden md:flex items-center gap-7">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-accent"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        <Volume2 className="w-5 h-5 text-text-secondary hidden md:block" />
        <Link
          href="/mix"
          className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-[13px] font-semibold text-white bg-accent rounded-full"
        >
          <span className="hidden sm:inline">Start Mixing</span>
          <span className="sm:hidden">Mix</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </nav>
  );
}
