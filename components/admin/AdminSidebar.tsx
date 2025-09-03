"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Trophy, User, FilePlus2, Menu, X } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/admin/profile", label: "Profile", icon: User },
  { href: "/admin/problems", label: "Add Problem Statements", icon: FilePlus2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <aside className="border-r bg-card md:w-64 md:min-h-screen md:sticky md:top-0">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b">
        <div className="font-semibold">Admin</div>
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          className="p-2 rounded-md border hover:bg-muted"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Nav list */}
      <nav className={`md:block ${open ? "block" : "hidden"} md:pt-4`}>
        <ul className="p-2 md:p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon as any;
            const active = pathname === item.href || pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors border hover:bg-muted/70 ${
                    active ? "bg-muted border-muted-foreground/20" : "border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
