"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Maximize2 } from "lucide-react";
import { useAnimationStore } from "@/store/animation-store";
import { cn } from "@/lib/utils";

const links = [
  { href: "/mix", label: "Mix" },
  { href: "/timer", label: "Timer" },
  { href: "/presets", label: "Presets" },
];

export function Navbar() {
  const pathname = usePathname();
  const openImmersion = useAnimationStore((s) => s.openImmersion);

  return (
    <nav className="flex items-center justify-between h-14 md:h-16 px-5 md:px-8 bg-[#0B0B0ECC] backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-4 md:gap-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="ASMER" width={28} height={28} />
          <span className="text-lg md:text-xl font-bold tracking-[3px] text-text-primary">ASMER</span>
        </Link>
        <div className="hidden md:block w-1 h-1 rounded-full bg-text-muted" />
        <div className="hidden md:flex items-center gap-7">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[13px] font-medium transition-colors",
                pathname === link.href
                  ? "text-text-primary"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <button
        onClick={openImmersion}
        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover transition-colors cursor-pointer"
      >
        <Maximize2 className="w-4 h-4" />
        Focus Mode
      </button>
    </nav>
  );
}
