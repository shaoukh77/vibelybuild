"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButton from "./AuthButton";
import NotificationsBell from "./NotificationsBell";
import { onAuthChange } from "@/lib/firebase";

const tabs = [
  { href: "/", label: "Build" },
  { href: "/ads", label: "AI Ads" },
  { href: "/marketing", label: "Marketing" },
  { href: "/feed", label: "Feed" },
  { href: "/store", label: "Store" },
  { href: "/chat", label: "Chat" },
];

export default function TopNav() {
  const path = usePathname();
  const [currentUser, setCurrentUser] = useState(null);

  // Listen to auth state for NotificationsBell
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="sticky top-6 z-50 mx-auto max-w-7xl px-4">
      <div className="bg-white/5 border border-white/20 backdrop-blur-2xl rounded-full shadow-[0_0_40px_rgba(255,255,255,0.15)] px-4 py-3 flex items-center justify-between gap-4">
        {/* Navigation Links */}
        <div className="flex items-center gap-3">
          {tabs.map((t) => {
            const active = t.href === "/" ? path === "/" : path.startsWith(t.href);

            return active ? (
              // Active tab with gradient glow
              <Link
                key={t.href}
                href={t.href}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-purple-500/80 to-blue-500/80 px-5 py-2 rounded-full border border-white/20 backdrop-blur-md shadow-lg">
                  <span className="text-white font-bold text-sm whitespace-nowrap">
                    {t.label}
                  </span>
                </div>
              </Link>
            ) : (
              // Inactive tab
              <Link
                key={t.href}
                href={t.href}
                className="relative px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm font-medium whitespace-nowrap hover:scale-105 group"
              >
                <span className="relative z-10">{t.label}</span>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></div>
              </Link>
            );
          })}
        </div>

        {/* Beta Badge */}
        <div className="hidden md:flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full px-3 py-1.5 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
          <span className="text-yellow-200 font-bold text-xs tracking-wide">PRE-BETA</span>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications Bell */}
          <div className="flex items-center justify-center">
            <NotificationsBell currentUser={currentUser} />
          </div>

          {/* Auth Button */}
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
