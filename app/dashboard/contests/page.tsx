"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { Calendar, Clock, ExternalLink, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Basic contest type for the student view
export type Contest = {
  id: string;
  title: string;
  platform?: string; // e.g., Codeforces, LeetCode
  url?: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  description?: string;
  location?: string; // Online / On-campus
};

const demoContests: Contest[] = [
  {
    id: "cf-9001",
    title: "Codeforces Round #9001",
    platform: "Codeforces",
    url: "https://codeforces.com/",
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
    description: "A beginner-friendly div.3 round.",
    location: "Online",
  },
  {
    id: "lc-weekly-456",
    title: "LeetCode Weekly Contest 456",
    platform: "LeetCode",
    url: "https://leetcode.com/contest/",
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
    description: "Weekly contest to test your skills.",
    location: "Online",
  },
];

function useContests() {
  const { user } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Immediate runnable fallback from localStorage or demo
        const local = localStorage.getItem("codepvg_contests");
        if (local) {
          const parsed: Contest[] = JSON.parse(local);
          setContests(parsed);
          return;
        }
        // If nothing in storage, seed with demo list
        setContests(demoContests);
      } catch (e: any) {
        console.warn("Contests load error", e);
        setError(e?.message || "Failed to load contests");
        setContests(demoContests);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.token]);

  return { contests, setContests, loading, error };
}

function ContestCard({ c }: { c: Contest }) {
  const start = new Date(c.startTime);
  const end = new Date(c.endTime);
  const upcoming = end.getTime() > Date.now();
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-lg font-semibold">{c.title}</div>
          <div className="text-sm text-muted-foreground">
            {c.platform || "Contest"}
          </div>
          {c.description && (
            <div className="text-sm text-muted-foreground mt-1">{c.description}</div>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
            <span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4" /> {start.toLocaleString()}</span>
            <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> {end.toLocaleString()}</span>
            {c.location && (
              <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {c.location}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            upcoming ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-600"
          }`}>
            {upcoming ? "Upcoming" : "Ended"}
          </span>
          {c.url && (
            <a
              href={c.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:opacity-90 text-sm"
            >
              <ExternalLink className="w-4 h-4" /> Open
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function ContestsContent() {
  const { contests, loading, error } = useContests();
  const [query, setQuery] = useState("");

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const filter = (c: Contest) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        (c.platform || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
      );
    };

    const list = contests.filter(filter).sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));
    return {
      upcoming: list.filter((c) => +new Date(c.endTime) >= now),
      past: list.filter((c) => +new Date(c.endTime) < now).reverse(),
    };
  }, [contests, query]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold tracking-tight">Contests</h1>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contest title, platform, description"
            className="pl-9 w-[280px]"
          />
        </div>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">Loading contests…</div>
      )}
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <section className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground">Upcoming</div>
        {upcoming.length === 0 ? (
          <div className="p-4 rounded-lg border bg-background text-sm text-muted-foreground">No upcoming contests right now.</div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((c) => (
              <ContestCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground">Past</div>
        {past.length === 0 ? (
          <div className="p-4 rounded-lg border bg-background text-sm text-muted-foreground">No past contests to show.</div>
        ) : (
          <div className="space-y-3">
            {past.map((c) => (
              <ContestCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function StudentContestsPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-background p-0">
        <ContestsContent />
      </div>
    </ProtectedRoute>
  );
}
