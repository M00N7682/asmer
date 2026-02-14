"use client";

import { Tab } from "@/components/ui/Tab";
import { categories, type SoundCategory } from "@/audio/sounds";

interface CategoryTabsProps {
  activeCategory: SoundCategory;
  onCategoryChange: (category: SoundCategory) => void;
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-2">
      {categories.map((cat) => (
        <Tab
          key={cat.label}
          label={cat.label}
          count={cat.count}
          active={activeCategory === cat.label}
          onClick={() => onCategoryChange(cat.label)}
        />
      ))}
    </div>
  );
}
