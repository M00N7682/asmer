"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SlidersHorizontal, Timer, Bookmark, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/mix", label: "Mix", icon: SlidersHorizontal },
  { href: "/timer", label: "Timer", icon: Timer },
  { href: "/presets", label: "Presets", icon: Bookmark },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 bg-[#0A0A0AEE] backdrop-blur-md border-t border-border md:hidden">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center gap-1 py-2 px-3",
              active ? "text-accent" : "text-text-tertiary"
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
