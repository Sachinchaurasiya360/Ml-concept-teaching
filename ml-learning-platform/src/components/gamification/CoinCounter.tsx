"use client";

import { Coins } from "lucide-react";
import { useGamification } from "../../utils/gamification";

interface CoinCounterProps {
  compact?: boolean;
}

export default function CoinCounter({ compact = false }: CoinCounterProps) {
  const g = useGamification();

  if (compact) {
    return (
      <div
        className="flex items-center gap-1 px-2 py-0.5 rounded-full border-2 border-foreground font-hand text-[11px] font-bold"
        style={{ background: "#fff8e7", boxShadow: "2px 2px 0 #2b2a35" }}
      >
        <Coins className="w-3 h-3" style={{ color: "#d4a500" }} />
        {g.coins}
      </div>
    );
  }

  return (
    <div className="card-sketchy p-4 flex items-center gap-3" style={{ background: "#fff8e7" }}>
      <div
        className="w-12 h-12 rounded-full border-2 border-foreground flex items-center justify-center"
        style={{ background: "var(--accent-yellow)", boxShadow: "2px 2px 0 #2b2a35" }}
      >
        <Coins className="w-6 h-6 text-foreground" />
      </div>
      <div>
        <p className="font-hand text-2xl font-bold text-foreground leading-none">
          {g.coins.toLocaleString()}
        </p>
        <p className="font-hand text-[11px] text-muted-foreground uppercase tracking-wider">Coins</p>
      </div>
    </div>
  );
}
