"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Medal, Crown, Award, User, Search } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { Input } from "@/components/ui/input";

// Types aligned with student leaderboard
type ApiSummary = {
  currentStreak: number;
  totalUsers: number;
  problemsSolved: number;
  yourRank: number;
};

type ApiPerformer = {
  year: string;
  fullName: string;
  solved: number;
  streak: number;
  userId: string;
  branch: string;
};

type ApiActivity = { date: string; count: number };

type LeaderboardUser = {
  id: string;
  name: string;
  totalSolved: number;
  streak: number;
  points: number;
  rank: number;
  branch: string;
  year: string;
};

function MonthlyTimeline({ activity }: { activity: ApiActivity[] }) {
  const now = new Date();
  const monthsMeta = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const label = d.toLocaleString(undefined, { month: "short" });
    return { year: d.getFullYear(), month: d.getMonth(), label };
  });

  const buildMonth = (year: number, month: number) => {
    const end = new Date(year, month + 1, 0);
    const daysInMonth = end.getDate();
    const monthDays: { date: Date; level: number; count: number }[] = [];
    const map = new Map(activity.map((a) => [a.date, a.count] as const));
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const cnt = map.get(key) ?? 0;
      const level = cnt === 0 ? 0 : cnt < 2 ? 1 : cnt < 4 ? 2 : cnt < 8 ? 3 : 4;
      monthDays.push({ date: d, level, count: cnt });
    }
    return monthDays;
  };

  const getActivityColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-muted";
      case 1:
        return "bg-green-200";
      case 2:
        return "bg-green-300";
      case 3:
        return "bg-green-500";
      case 4:
        return "bg-green-700";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        {monthsMeta.map((m) => {
          const monthActivity = buildMonth(m.year, m.month);
          const totalActivity = monthActivity.reduce((sum, day) => sum + day.count, 0);
          return (
            <div key={`${m.year}-${m.month}`} className="text-center">
              <div className="text-xs font-medium text-muted-foreground mb-2">{m.label}</div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {monthActivity.slice(0, 28).map((day, idx) => (
                  <div key={idx} className={`w-3 h-3 rounded-sm ${getActivityColor(day.level)}`} />
                ))}
              </div>
              <div className="text-xs text-muted-foreground">{totalActivity}</div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-2 pt-4 border-t border-border">
        <span className="text-xs text-muted-foreground">Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div key={level} className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`} />
        ))}
        <span className="text-xs text-muted-foreground">More</span>
      </div>
    </div>
  );
}

function AdminLeaderboardContent() {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<"all" | "month" | "week">("all");
  const [branchFilter, setBranchFilter] = useState<"all" | "CSE" | "IT" | "ECE">("all");
  const [summary, setSummary] = useState<ApiSummary | null>(null);
  const [performers, setPerformers] = useState<ApiPerformer[]>([]);
  const [activity, setActivity] = useState<ApiActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = user?.token || (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined);
        const res = await fetch("http://localhost:4545/api/admin/leaderboard/summary", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed to load leaderboard (${res.status})`);
        const data = (await res.json()) as { summary: ApiSummary; performers: ApiPerformer[]; activity: ApiActivity[] };
        setSummary(data?.summary ?? null);
        setPerformers(Array.isArray(data?.performers) ? data.performers : []);
        setActivity(Array.isArray(data?.activity) ? data.activity : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData: LeaderboardUser[] = useMemo(() => {
    const base = performers.map((p, idx) => ({
      id: p.userId,
      name: p.fullName,
      totalSolved: p.solved,
      streak: p.streak,
      points: p.solved,
      rank: idx + 1,
      branch: p.branch,
      year: p.year,
    }));
    const norm = search.trim().toLowerCase();
    return base
      .filter((u) => branchFilter === "all" || u.branch === branchFilter)
      .filter((u) =>
        norm === ""
          ? true
          : u.name.toLowerCase().includes(norm) ||
            u.branch.toLowerCase().includes(norm) ||
            u.year.toLowerCase().includes(norm)
      );
  }, [performers, branchFilter, search]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200";
      default:
        return "bg-card border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Top Performers only */}
      <div className="rounded-xl bg-card border border-border shadow">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
            <h2 className="text-xl font-semibold">Top Performers</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-1">
                {(["all", "month", "week"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors capitalize ${
                      filter === timeFilter ? "bg-accent text-accent-foreground" : "bg-muted hover:bg-accent/10 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filter === "all" ? "All Time" : filter}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {(["all", "CSE", "IT", "ECE"] as const).map((branch) => (
                  <button
                    key={branch}
                    onClick={() => setBranchFilter(branch)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      branch === branchFilter ? "bg-secondary text-secondary-foreground" : "bg-muted hover:bg-secondary/10 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {branch === "all" ? "All Branches" : branch}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, branch, year"
                className="pl-9 w-full md:w-96"
              />
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {filteredData.map((u) => (
              <div key={u.id} className={`p-4 rounded-lg border transition-all hover:shadow-md ${getRankBg(u.rank)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center">{getRankIcon(u.rank)}</div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{u.name}</div>
                        <div className="text-sm text-muted-foreground">{u.branch} • {u.year}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{u.totalSolved}</div>
                      <div className="text-xs text-muted-foreground">Solved</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{u.streak}</div>
                      <div className="text-xs text-muted-foreground">Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{u.points}</div>
                      <div className="text-xs text-muted-foreground">Points</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="p-4 mt-6 rounded-md border border-red-300 bg-red-50 text-red-700 text-sm">{error}</div>}
    </div>
  );
}

export default function AdminLeaderboardPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLeaderboardContent />
    </ProtectedRoute>
  );
}
