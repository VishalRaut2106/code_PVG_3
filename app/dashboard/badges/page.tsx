// app/dashboard/badges/page.tsx
"use client";

import { Award, Flame, Shield, Crown, Star, Zap, Rocket, BookOpen } from "lucide-react";

const BADGES = [
  { name: "100 Problems", icon: Award },
  { name: "30 Day Streak", icon: Flame },
  { name: "DP Master", icon: Shield },
  { name: "Top 10%", icon: Crown },
  { name: "Early Bird", icon: Star },
  { name: "Speed Coder", icon: Zap },
  { name: "Contest Champ", icon: Rocket },
  { name: "Book Worm", icon: BookOpen },
];

export default function BadgesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Badges</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {BADGES.map((B) => (
          <div key={B.name} className="p-5 rounded-xl border border-border/70 bg-card hover:shadow-md transition">
            <div className="flex items-center gap-2 text-accent mb-1">
              <B.icon className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">Badge</span>
            </div>
            <div className="font-medium">{B.name}</div>
            <div className="mt-2 text-xs text-muted-foreground">Unlocked • 2025-03-10</div>
          </div>
        ))}
      </div>
    </div>
  );
}
