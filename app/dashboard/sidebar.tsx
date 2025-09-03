"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Github, Linkedin } from "lucide-react";

type Profile = {
  name: string;
  email: string;
  phone: string;
  year: string;
  branch: string;
  photoDataUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  headline?: string;
};

const NAV = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Problems", href: "/dashboard/problems" },
  { label: "Contests", href: "/dashboard/contests" },
  { label: "Leaderboard", href: "/dashboard/leaderboard" },
  { label: "Badges", href: "/dashboard/badges" },
  { label: "Settings", href: "/dashboard/settings" },
];

const DEFAULT_PROFILE: Profile = {
  name: "Student",
  email: "",
  phone: "",
  year: "",
  branch: "",
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout: authLogout } = useAuth();

  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load profile from localStorage + Auth context
  const loadProfile = () => {
    try {
      const raw = localStorage.getItem("codepvg_profile");
      const parsed = raw ? (JSON.parse(raw) as Profile) : {} as Partial<Profile>;

      // Prefer Auth and login-time localStorage values
      const nameFromAuth = user?.name || localStorage.getItem("userName") || parsed.name;
      const branchFromAuth = localStorage.getItem("userBranch") || parsed.branch;
      const yearFromAuth = localStorage.getItem("userYear") || parsed.year;
      const emailFromAuth = user?.email || localStorage.getItem("userEmail") || parsed.email;
      const githubUrl = localStorage.getItem("githubUrl") || parsed.githubUrl;
      const linkedinUrl = localStorage.getItem("linkedinUrl") || parsed.linkedinUrl;
      const headline = localStorage.getItem("userHeadline") || parsed.headline;

      const merged: Profile = {
        ...DEFAULT_PROFILE,
        ...parsed,
        name: nameFromAuth || DEFAULT_PROFILE.name,
        branch: branchFromAuth || DEFAULT_PROFILE.branch,
        year: yearFromAuth || DEFAULT_PROFILE.year,
        email: emailFromAuth || DEFAULT_PROFILE.email,
        githubUrl,
        linkedinUrl,
        headline,
      };

      setProfile(merged);
    } catch {
      setProfile(DEFAULT_PROFILE);
    }
  };

  useEffect(() => {
    loadProfile();

    // Listen for settings save (custom event)
    const onProfileUpdated = () => loadProfile();
    window.addEventListener("profile-updated", onProfileUpdated as EventListener);

    // Click outside to close menu
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);

    return () => {
      window.removeEventListener("profile-updated", onProfileUpdated as EventListener);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("codepvg_profile");
    setMenuOpen(false);
    authLogout();
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-border p-6 flex flex-col min-h-screen">
      {/* Profile header with menu */}
      <div className="relative mb-8" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((s) => !s)}
          className="flex items-center space-x-3 w-full text-left"
        >
          <div className="relative">
            <Image
              src={profile.photoDataUrl || "/images/profile.png"}
              alt="Profile"
              width={48}
              height={48}
              className="rounded-full border border-border"
            />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-lg truncate">{profile.name}</h2>
            {profile.headline && (
              <p className="text-muted-foreground text-sm truncate">{profile.headline}</p>
            )}
            {(() => {
              const parts = [profile.branch, profile.year].filter(Boolean).join(" • ");
              return parts ? (
                <p className="text-muted-foreground text-sm truncate">{parts}</p>
              ) : null;
            })()}
            {(profile.githubUrl || profile.linkedinUrl) && (
              <div className="flex items-center gap-2 mt-1">
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer" title="GitHub" className="text-muted-foreground hover:text-foreground">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" title="LinkedIn" className="text-muted-foreground hover:text-foreground">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </button>

        {menuOpen && (
          <div className="absolute z-20 mt-2 w-48 rounded-lg border border-border bg-card shadow-md">
            <Link
              href="/dashboard/settings"
              className="block px-3 py-2 text-sm hover:bg-muted rounded-t-lg"
              onClick={() => setMenuOpen(false)}
            >
              View profile
            </Link>
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-b-lg"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="space-y-2 text-sm">
        {NAV.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg transition border ${
                active
                  ? "bg-sidebar-accent/20 text-foreground border-sidebar-border"
                  : "border-transparent hover:bg-sidebar-accent/15"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Profile completion */}
      <div className="mt-auto pt-6">
        <div className="text-xs text-muted-foreground mb-2">Profile completion</div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-accent animate-pulse-glow"
            style={{ width: "72%" }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">72% complete</div>
      </div>
    </aside>
  );
}
