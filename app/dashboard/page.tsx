"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Star, Target, LogOut, User, Check } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

type BackendProblem = {
  id: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  solvePercentage?: number;
  number?: number;
  isSolved?: boolean;
};

// no hardcoded problems; problems come from backend

// API response types for student dashboard
type DashboardResponse = {
  badges: any[];
  totalProblemsSolved: number;
  rank: {
    globalRank: number;
    totalUsers: number;
    percentile: number;
  };
  user: {
    email: string;
    branch: string;
    fullName: string;
  };
  weeklyGoal: {
    weekStart: string;
    percentage: number;
    weekEnd: string;
    completed: number;
    target: number;
  };
};

type DifficultyFilter = "All" | "Easy" | "Medium" | "Hard";
const DIFFICULTIES: readonly DifficultyFilter[] = ["All", "Easy", "Medium", "Hard"] as const;

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("All");
  const [dash, setDash] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [problems, setProblems] = useState<BackendProblem[]>([]);
  const [problemsLoading, setProblemsLoading] = useState<boolean>(false);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = user?.token || (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined);
        const res = await fetch("http://localhost:4545/api/student/dashboard", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`Failed to load dashboard (${res.status})`);
        }
        const data: DashboardResponse = await res.json();
        setDash(data);
        // Sync profile data (for sidebar/settings) and notify listeners
        try {
          if (typeof window !== "undefined") {
            if (data?.user?.fullName) localStorage.setItem("userName", data.user.fullName);
            if (data?.user?.branch) localStorage.setItem("userBranch", data.user.branch);
            if (data?.user?.email) localStorage.setItem("userEmail", data.user.email);
            if ((data as any)?.user?.mobileNumber) localStorage.setItem("userMobile", (data as any).user.mobileNumber);
            if ((data as any)?.user?.headline) localStorage.setItem("userHeadline", (data as any).user.headline);
            if ((data as any)?.user?.bio) localStorage.setItem("userBio", (data as any).user.bio);
            if ((data as any)?.user?.githubUrl) localStorage.setItem("githubUrl", (data as any).user.githubUrl);
            if ((data as any)?.user?.linkedinUrl) localStorage.setItem("linkedinUrl", (data as any).user.linkedinUrl);
            if ((data as any)?.user?.prnNumber) localStorage.setItem("userPrn", (data as any).user.prnNumber);
            // Normalize year values from API to match settings options
            const normalizeYear = (y?: string) => {
              if (!y) return undefined;
              const t = y.toLowerCase();
              if (t.includes("1")) return "First Year";
              if (t.includes("2")) return "Second Year";
              if (t.includes("3")) return "Third Year";
              if (t.includes("4") || t.includes("final")) return "Final Year";
              // Fallback: if already in expected format, keep
              if (["first year","second year","third year","final year"].includes(t)) return y;
              return undefined;
            };
            const normYear = normalizeYear((data as any)?.user?.year);
            if (normYear) localStorage.setItem("userYear", normYear);
            const evt = new Event("profile-updated");
            window.dispatchEvent(evt);
          }
        } catch {}
      } catch (e: any) {
        console.error("Dashboard fetch error:", e);
        setError(e?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch problems list
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setProblemsLoading(true);
        const token = user?.token || (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined);
        const res = await fetch("http://localhost:4545/api/student/problems", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed to load problems (${res.status})`);
        const data = (await res.json()) as any[];
        const mapped: BackendProblem[] = (data || []).map((item: any) => ({
          id: item?.id,
          title: item?.title,
          difficulty: item?.difficulty,
          solvePercentage: item?.solvePercentage,
          number: item?.number,
          isSolved: Boolean(item?.isSolved),
        })).filter(p => !!p.id && !!p.title && !!p.difficulty);
        setProblems(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setProblemsLoading(false);
      }
    };
    fetchProblems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter problems by difficulty
  const filteredProblems = useMemo(() => {
    let list = problems;
    if (difficultyFilter !== "All") {
      const wanted = difficultyFilter.toUpperCase();
      list = list.filter((p) => p.difficulty === wanted);
    }
    return list;
  }, [problems, difficultyFilter]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
      case "Easy": return "text-green-600";
      case "MEDIUM":
      case "Medium": return "text-amber-600";
      case "HARD":
      case "Hard": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header with user info and logout */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <User className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {dash?.user?.fullName || user?.name || "Student"}!</h1>
            <p className="text-muted-foreground">Continue your coding journey</p>
          </div>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>

      {/* Loading / Error states for API-driven KPI cards */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="p-5 rounded-xl bg-card border border-border shadow-sm animate-pulse h-24" />
          <div className="p-5 rounded-xl bg-card border border-border shadow-sm animate-pulse h-24" />
          <div className="p-5 rounded-xl bg-card border border-border shadow-sm animate-pulse h-24" />
          <div className="p-5 rounded-xl bg-card border border-border shadow-sm animate-pulse h-24" />
        </div>
      )}
      {error && (
        <div className="p-4 mb-6 rounded-md border border-red-300 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Top cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="p-5 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10"><Trophy className="text-accent" /></div>
              <div>
                <div className="text-xs text-muted-foreground">Rank</div>
                <div className="text-2xl font-bold">#{dash?.rank?.globalRank ?? "-"}</div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10"><Star className="text-secondary" /></div>
              <div>
                <div className="text-xs text-muted-foreground">Badges</div>
                <div className="text-2xl font-bold">{dash?.badges?.length ?? 0}</div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-3/10"><Target className="text-chart-3" /></div>
              <div>
                <div className="text-xs text-muted-foreground">Weekly Goal</div>
                <div className="text-2xl font-bold">{dash?.weeklyGoal ? `${dash.weeklyGoal.completed}/${dash.weeklyGoal.target}` : "0/0"}</div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-card border border-border shadow-sm">
            <div className="text-xs text-muted-foreground">Total Problems Solved</div>
            <div className="text-2xl font-bold">
              {dash?.totalProblemsSolved ?? 0}
            </div>
          </div>
        </div>
      )}

      {/* Problems List */}
      <div className="rounded-xl bg-card border border-border shadow">
        {/* Header with filters */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Problems</h2>
          </div>

          {/* Difficulty filter */}
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${d === difficultyFilter
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted hover:bg-accent/10 text-muted-foreground hover:text-foreground"
                  }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">#</th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">Title</th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">Difficulty</th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">Solved %</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.map((problem, index) => (
                <tr
                  key={problem.id}
                  className="border-b border-border hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => router.push(`/ide/${problem.id}`)}
                >
                  <td className="p-4 w-24 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center justify-center w-4 h-4 rounded-full border ${problem.isSolved
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-muted-foreground/40'
                        }`}
                        aria-label={problem.isSolved ? 'Solved' : 'Unsolved'}
                        title={problem.isSolved ? 'Solved' : 'Unsolved'}
                      >
                        {problem.isSolved && <Check className="w-3 h-3" />}
                      </span>
                      <span>{problem.number ?? (index + 1)}.</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium hover:text-accent transition-colors">{problem.title}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {typeof problem.solvePercentage === "number" ? `${Math.round(problem.solvePercentage)}%` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProblems.length === 0 && !problemsLoading && (
          <div className="p-8 text-center text-muted-foreground">
            No problems found for the selected filters.
          </div>
        )}
        {problemsLoading && (
          <div className="p-8 text-center text-muted-foreground">Loading problems...</div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <DashboardContent />
    </ProtectedRoute>
  );
}
