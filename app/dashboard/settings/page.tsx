"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Profile Settings (client)
 * - Large circular avatar with camera overlay (bottom-right)
 * - Predefined avatar options (initials-style)
 * - Upload & preview (URL.createObjectURL)
 * - Remove photo button
 * - Form fields (name, email, mobile, branch, year, bio)
 * - Save profile saves to localStorage (frontend-only)
 */

type PresetAvatar = {
  id: number;
  initials: string;
  bg: string; // tailwind/inline background
  fg?: string;
};

const PRESET_AVATARS: PresetAvatar[] = [
  { id: 0, initials: "RB", bg: "linear-gradient(135deg,#FDE68A,#FCA5A5)" },
  { id: 1, initials: "AK", bg: "linear-gradient(135deg,#C7F9CC,#6EE7B7)" },
  { id: 2, initials: "SM", bg: "linear-gradient(135deg,#A5B4FC,#60A5FA)" },
  { id: 3, initials: "TV", bg: "linear-gradient(135deg,#FBCFE8,#F472B6)" },
  { id: 4, initials: "NV", bg: "linear-gradient(135deg,#FDE68A,#FCD34D)" },
];

export default function ProfileSettings() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [bio, setBio] = useState("");
  const [prn, setPrn] = useState("");
  const [username, setUsername] = useState("");
  const [headline, setHeadline] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // uploaded image URL
  const [presetIndex, setPresetIndex] = useState<number | null>(null); // selected preset avatar
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const load = () => {
      const savedName = localStorage.getItem("userName");
      const savedEmail = localStorage.getItem("userEmail");
      const savedMobile = localStorage.getItem("userMobile");
      const savedBranch = localStorage.getItem("userBranch");
      const savedYear = localStorage.getItem("userYear");
      const savedBio = localStorage.getItem("userBio");
      const savedPrn = localStorage.getItem("userPrn");
      const savedUsername = localStorage.getItem("userUsername");
      const savedHeadline = localStorage.getItem("userHeadline");
      const savedGithubUrl = localStorage.getItem("githubUrl");
      const savedLinkedinUrl = localStorage.getItem("linkedinUrl");
      const savedAvatarUrl = localStorage.getItem("userAvatarUrl");
      const savedPreset = localStorage.getItem("userAvatarPreset");
      if (savedName) setName(savedName);
      if (savedEmail) setEmail(savedEmail);
      if (savedMobile) setMobile(savedMobile);
      if (savedBranch) setBranch(savedBranch);
      if (savedYear) setYear(savedYear);
      if (savedBio) setBio(savedBio);
      if (savedPrn) setPrn(savedPrn);
      if (savedUsername) setUsername(savedUsername);
      if (savedHeadline) setHeadline(savedHeadline);
      if (savedGithubUrl) setGithubUrl(savedGithubUrl);
      if (savedLinkedinUrl) setLinkedinUrl(savedLinkedinUrl);
      if (savedAvatarUrl) setAvatarUrl(savedAvatarUrl);
      if (savedPreset) setPresetIndex(Number(savedPreset));
    };

    load();
    const onProfileUpdated = () => load();
    window.addEventListener("profile-updated", onProfileUpdated as EventListener);
    return () => window.removeEventListener("profile-updated", onProfileUpdated as EventListener);
  }, []);

  const handleFilePick = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    setPresetIndex(null);
    localStorage.setItem("userAvatarUrl", url);
    localStorage.removeItem("userAvatarPreset");
  };

  const removePhoto = () => {
    setAvatarUrl(null);
    setPresetIndex(null);
    localStorage.removeItem("userAvatarUrl");
    localStorage.removeItem("userAvatarPreset");
  };

  const pickPreset = (idx: number) => {
    setPresetIndex(idx);
    setAvatarUrl(null);
    localStorage.setItem("userAvatarPreset", String(idx));
    localStorage.removeItem("userAvatarUrl");
  };

  const saveProfile = async () => {
    // Persist locally first
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userMobile", mobile);
    localStorage.setItem("userBranch", branch);
    localStorage.setItem("userYear", year);
    localStorage.setItem("userBio", bio);
    localStorage.setItem("userUsername", username);
    localStorage.setItem("userHeadline", headline);
    localStorage.setItem("githubUrl", githubUrl);
    localStorage.setItem("linkedinUrl", linkedinUrl);

    // Notify sidebar
    try { window.dispatchEvent(new Event("profile-updated")); } catch {}

    // Call backend
    try {
      setSaving(true);
      const token = user?.token || localStorage.getItem("token") || undefined;
      const res = await fetch("http://localhost:4545/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          username,
          email,
          fullName: name,
          bio,
          headline,
          linkedinUrl,
          githubUrl,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Failed to update profile (${res.status})`);
      }
      alert("Profile updated successfully.");
    } catch (e: any) {
      alert(e?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const renderAvatar = () => {
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-full h-full object-cover block"
        />
      );
    }
    if (presetIndex !== null && PRESET_AVATARS[presetIndex]) {
      const p = PRESET_AVATARS[presetIndex];
      return (
        <div
          className="w-full h-full grid place-items-center font-semibold text-2xl"
          style={{ background: p.bg }}
        >
          <span className="text-gray-900/90">{p.initials}</span>
        </div>
      );
    }
    // default initials from name
    const initials = name
      ? name
          .split(" ")
          .map((s) => s[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : null;
    return (
      <div className="w-full h-full grid place-items-center bg-muted text-muted-foreground">
        {initials || <span>No photo</span>}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto rounded-2xl bg-card border border-border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar column */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div
                className="w-44 h-44 rounded-full border border-border overflow-hidden shadow-md"
                aria-hidden
              >
                {renderAvatar()}
              </div>

              {/* camera overlay */}
              <button
                title="Change photo"
                onClick={() => fileRef.current?.click()}
                className="absolute -right-2 -bottom-2 bg-accent text-accent-foreground rounded-full p-3 border border-border shadow-md hover:scale-105 transition-transform"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFilePick(f);
              }}
            />

            <div className="flex gap-3">
              <button
                onClick={removePhoto}
                className="flex items-center gap-2 px-3 py-1 rounded border border-border/60 bg-background text-sm"
              >
                <Trash2 className="w-4 h-4" /> Remove photo
              </button>
            </div>

            <div className="w-full">
              <div className="text-sm text-muted-foreground mb-2">Choose avatar</div>
              <div className="flex gap-3">
                {PRESET_AVATARS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => pickPreset(p.id)}
                    className={`w-12 h-12 rounded-full border-2 ${presetIndex === p.id ? "ring-2 ring-accent/40" : "border-border/40"} overflow-hidden`}
                    title={`Use avatar ${p.initials}`}
                    style={{ background: p.bg }}
                  >
                    <div className="w-full h-full grid place-items-center font-semibold text-sm text-gray-900/90">{p.initials}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form column - span 2 */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Full name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Mobile</label>
                <Input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Branch</label>
                <Input
                  value={branch}
                  readOnly
                  disabled
                  className="mt-1 bg-muted cursor-not-allowed"
                />
                <div className="text-xs text-muted-foreground mt-1">Branch is fixed from your institute records.</div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-1 w-full h-10 rounded border border-border/60 px-2 bg-background"
                >
                  <option value="">Select year</option>
                  <option value="First Year">First Year</option>
                  <option value="Second Year">Second Year</option>
                  <option value="Third Year">Third Year</option>
                  <option value="Final Year">Final Year</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">PRN</label>
                <Input value={prn} disabled className="mt-1 opacity-70" />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Headline</label>
                <Input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="mt-1"
                  placeholder="Your professional headline"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">LinkedIn URL</label>
                <Input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="mt-1"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">GitHub URL</label>
                <Input
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="mt-1"
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Bio (optional)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full mt-1 rounded border border-border/60 p-3 bg-background"
                  placeholder="Tell about yourself (optional)"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <Button onClick={saveProfile} disabled={saving} className="px-6 py-2">{saving ? "Saving..." : "Save profile"}</Button>
              <div className="text-sm text-muted-foreground">
                Your profile is synced with the server when you save.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
