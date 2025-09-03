"use client";

import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AdminProfilePage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    avatarUrl: "",
    bio: "",
  });

  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = user?.token || (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined);
        const res = await fetch("http://localhost:4545/api/admin/me", {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setForm({
          name: data?.name || "",
          email: data?.email || "",
          phone: data?.phone || "",
          avatarUrl: data?.avatarUrl || "",
          bio: data?.bio || "",
        });
      } catch (err: any) {
        console.warn("Failed to load profile:", err?.message || err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.token]);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = user?.token || (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined);
      const res = await fetch("http://localhost:4545/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: "Profile updated" });
    } catch (err: any) {
      toast({ title: "Update failed", description: err?.message || "Could not update profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwd.newPassword || pwd.newPassword !== pwd.confirmPassword) {
      toast({ title: "Password mismatch", description: "New password and confirmation must match", variant: "destructive" });
      return;
    }
    try {
      setChangingPwd(true);
      const token = user?.token || (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined);
      const res = await fetch("http://localhost:4545/api/admin/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: "Password changed" });
      setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast({ title: "Change failed", description: err?.message || "Could not change password", variant: "destructive" });
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Admin Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your basic information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={updateProfile} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} disabled={loading} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={form.email} disabled placeholder="email" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} disabled={loading} />
              </div>
              <div>
                <Label>Avatar URL</Label>
                <Input value={form.avatarUrl} onChange={(e) => setForm((s) => ({ ...s, avatarUrl: e.target.value }))} disabled={loading} />
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea rows={4} value={form.bio} onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))} disabled={loading} />
              </div>
              <Button type="submit" disabled={saving || loading} className="inline-flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Use a strong, unique password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <Label>Current Password</Label>
                <Input type="password" value={pwd.currentPassword} onChange={(e) => setPwd((s) => ({ ...s, currentPassword: e.target.value }))} />
              </div>
              <div>
                <Label>New Password</Label>
                <Input type="password" value={pwd.newPassword} onChange={(e) => setPwd((s) => ({ ...s, newPassword: e.target.value }))} />
              </div>
              <div>
                <Label>Confirm New Password</Label>
                <Input type="password" value={pwd.confirmPassword} onChange={(e) => setPwd((s) => ({ ...s, confirmPassword: e.target.value }))} />
              </div>
              <Button type="submit" disabled={changingPwd} className="inline-flex items-center gap-2">
                {changingPwd && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
