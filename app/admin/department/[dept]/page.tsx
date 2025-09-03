"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// Types should align with admin data usage
type StudentProject = {
  id: string;
  studentName: string;
  title: string;
  link?: string;
  department: string;
  year: string;
};

const YEAR_OPTIONS = ["All", "First Year", "Second Year", "Third Year", "Final Year"] as const;

type YearOpt = typeof YEAR_OPTIONS[number];

function YearHeatmap({ months = 12, square = 9, gap = 2 }: { months?: number; square?: number; gap?: number }) {
  const weeks = 53;
  const cols = new Array(weeks).fill(0).map((_, i) => i);
  const levelFor = (week: number, day: number) => ((week * 7 + day * 3 + 2) % 5);
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[2px]">
        {cols.map((w) => (
          <div key={w} className="flex flex-col gap-[2px]" style={{ marginRight: gap }}>
            {new Array(7).fill(0).map((_, d) => {
              const lvl = levelFor(w, d);
              const cls = lvl === 0
                ? "bg-accent/10"
                : lvl === 1
                ? "bg-accent/25"
                : lvl === 2
                ? "bg-accent/45"
                : lvl === 3
                ? "bg-accent/70"
                : "bg-accent";
              return <div key={`${w}-${d}`} className={`rounded-[2px] ${cls}`} style={{ width: square, height: square }} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDepartmentRankingsPage() {
  const params = useParams<{ dept: string }>();
  const router = useRouter();
  const dept = decodeURIComponent(params?.dept ?? "");
  const [year, setYear] = useState<YearOpt>("All");
  const [projects, setProjects] = useState<StudentProject[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("codepvg_student_projects");
      const list: StudentProject[] = raw ? JSON.parse(raw) : [];
      setProjects(list);
    } catch {}

    const onStorage = (e: StorageEvent) => {
      if (e.key === "codepvg_student_projects") {
        try {
          const list: StudentProject[] = e.newValue ? JSON.parse(e.newValue) : [];
          setProjects(list);
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filtered = useMemo(() => {
    return projects.filter(
      (p) => p.department === dept && (year === "All" || p.year === year)
    );
  }, [projects, dept, year]);

  const rankings = useMemo(() => {
    const map = new Map<string, { count: number; years: Set<string> }>();
    for (const p of filtered) {
      const entry = map.get(p.studentName) || { count: 0, years: new Set<string>() };
      entry.count += 1;
      entry.years.add(p.year);
      map.set(p.studentName, entry);
    }
    return Array.from(map.entries())
      .map(([studentName, v]) => ({ studentName, count: v.count, years: v.years }))
      .sort((a, b) => (b.count - a.count) || a.studentName.localeCompare(b.studentName));
  }, [filtered]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-semibold">Departmental Rankings — {dept}</h1>
        <div className="flex items-center gap-2">
          <select className="border rounded-md px-3 py-2" value={year} onChange={(e) => setYear(e.target.value as YearOpt)}>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y === "All" ? "All Years" : y}</option>
            ))}
          </select>
          <button onClick={() => router.push("/admin")} className="px-3 py-2 border rounded-md">Back</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-xl border border-border/70 bg-card">
          <div className="p-4 border-b border-border/70 font-semibold">Top Students</div>
          <div className="p-4 space-y-3">
            {rankings.length === 0 && (
              <div className="text-sm text-muted-foreground">No data yet.</div>
            )}
            {rankings.map((u, i) => (
              <div key={u.studentName} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/60">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full grid place-items-center text-xs font-bold ${
                    i === 0 ? "bg-yellow-400/30 text-yellow-800"
                    : i === 1 ? "bg-gray-300/30 text-gray-800"
                    : i === 2 ? "bg-amber-500/30 text-amber-900"
                    : "bg-muted text-foreground/70"
                  }`}>{i + 1}</div>
                  <div className="flex flex-col">
                    <span className="font-medium">{u.studentName}</span>
                    <span className="text-xs text-muted-foreground">{Array.from(u.years).join(", ") || "—"}</span>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{u.count} project{u.count !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card">
          <div className="p-4 border-b border-border/70">
            <div className="font-semibold">12-Month Streak Heatmap</div>
            <div className="text-xs text-muted-foreground">Contribution activity (theme-aware)</div>
          </div>
          <div className="p-4">
            <YearHeatmap square={9} gap={2} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-card">
        <div className="p-4 border-b border-border/70 font-semibold">All Projects — {dept}{year !== "All" ? ` — ${year}` : ""}</div>
        <div className="p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Student</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Year</th>
                <th className="py-2 pr-4">Link</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-3 text-muted-foreground">No projects yet.</td>
                </tr>
              )}
              {filtered.map((p, idx) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{idx + 1}</td>
                  <td className="py-2 pr-4 font-medium">{p.studentName}</td>
                  <td className="py-2 pr-4">{p.title}</td>
                  <td className="py-2 pr-4">{p.year}</td>
                  <td className="py-2 pr-4">{p.link ? <a className="text-secondary underline" href={p.link} target="_blank">Open</a> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
