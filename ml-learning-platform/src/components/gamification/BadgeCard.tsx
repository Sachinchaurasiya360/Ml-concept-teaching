"use client";

import type { BadgeDef } from "../../utils/gamification";

const RARITY_STYLES: Record<BadgeDef["rarity"], { bg: string; label: string }> = {
  common: { bg: "#f3efe6", label: "Common" },
  uncommon: { bg: "#e8fff5", label: "Uncommon" },
  rare: { bg: "#e6f1ff", label: "Rare" },
  epic: { bg: "#f4e7ff", label: "Epic" },
  legendary: { bg: "#fff3d9", label: "Legendary" },
};

interface BadgeCardProps {
  badge: BadgeDef;
  earned: boolean;
}

export default function BadgeCard({ badge, earned }: BadgeCardProps) {
  const style = RARITY_STYLES[badge.rarity];
  return (
    <div
      className={`card-sketchy p-3 text-center transition-all ${earned ? "" : "opacity-45 grayscale"}`}
      style={{ background: style.bg }}
      title={earned ? badge.description : `Locked: ${badge.description}`}
    >
      <div className="text-3xl mb-1" aria-hidden>{badge.icon}</div>
      <p className="font-hand text-xs font-bold text-foreground leading-tight">{badge.name}</p>
      <p className="font-hand text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
        {style.label}
      </p>
    </div>
  );
}
