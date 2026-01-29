"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useTheme } from "@/hooks/useTheme";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
    const pathname = usePathname();
    const { isMuted, toggleMute } = useSoundEffects();
    const { theme } = useTheme();

    const isActive = (path: string) => pathname === path;

    return (
        <header className="fixed top-0 w-full z-50 glass-panel h-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 no-underline">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-cyan-500/20">
                        <iconify-icon icon="solar:keyboard-linear" class="text-white text-lg" stroke-width="1.5"></iconify-icon>
                    </div>
                    <span className="logo-text text-xl font-semibold tracking-tight">
                        TypMeter
                    </span>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center rounded-full nav-container p-1.5">
                    <Link
                        href="/"
                        className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/')
                            ? "bg-slate-100 dark:bg-slate-700/50 shadow-sm ring-1 ring-slate-200/50 dark:ring-0"
                            : ""
                            }`}
                        style={{
                            color: isActive('/')
                                ? (theme === 'dark' ? '#ffffff' : '#000000')
                                : (theme === 'dark' ? '#94a3b8' : '#64748b')
                        }}
                    >
                        Test
                    </Link>

                    <Link
                        href="/games"
                        className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/games')
                            ? "bg-slate-100 dark:bg-slate-700/50 shadow-sm ring-1 ring-slate-200/50 dark:ring-0"
                            : ""
                            }`}
                        style={{
                            color: isActive('/games')
                                ? (theme === 'dark' ? '#ffffff' : '#000000')
                                : (theme === 'dark' ? '#94a3b8' : '#64748b')
                        }}
                    >
                        Games
                    </Link>
                    <Link
                        href="/leaderboard"
                        className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/leaderboard')
                            ? "bg-slate-100 dark:bg-slate-700/50 shadow-sm ring-1 ring-slate-200/50 dark:ring-0"
                            : ""
                            }`}
                        style={{
                            color: isActive('/leaderboard')
                                ? (theme === 'dark' ? '#ffffff' : '#000000')
                                : (theme === 'dark' ? '#94a3b8' : '#64748b')
                        }}
                    >
                        Leaderboard
                    </Link>
                    <Link
                        href="/about"
                        className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/about')
                            ? "bg-slate-100 dark:bg-slate-700/50 shadow-sm ring-1 ring-slate-200/50 dark:ring-0"
                            : ""
                            }`}
                        style={{
                            color: isActive('/about')
                                ? (theme === 'dark' ? '#ffffff' : '#000000')
                                : (theme === 'dark' ? '#94a3b8' : '#64748b')
                        }}
                    >
                        About
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-5">
                    <ThemeToggle />
                    <button
                        onClick={toggleMute}
                        className="text-slate-400 transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors focus:outline-none"
                        title={isMuted ? "Unmute Sound" : "Mute Sound"}
                    >
                        <iconify-icon
                            icon={isMuted ? "solar:volume-cross-linear" : "solar:volume-high-linear"}
                            width="22"
                        ></iconify-icon>
                    </button>
                    <div className="h-6 w-px bg-white/10"></div>

                    <SignedIn>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-8 h-8 rounded-full border border-white/10 hover:border-cyan-400/50 transition-colors"
                                }
                            }}
                        />
                    </SignedIn>

                    <SignedOut>
                        <Link
                            href="/sign-in"
                            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:opacity-90 transition-opacity"
                        >
                            Sign In
                        </Link>
                    </SignedOut>
                </div>
            </div>
        </header>
    );
}
