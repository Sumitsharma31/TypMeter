"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { supabase, LeaderboardEntry, isSupabaseConfigured } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";

export default function Leaderboard({ refreshTrigger = 0 }: { refreshTrigger?: number }) {
    const { isSignedIn } = useAuth();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        // Only fetch if user is signed in and Supabase is configured
        if (!isSignedIn || !isSupabaseConfigured) return;

        async function fetchLeaderboard() {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from("test_results")
                    .select(`
            id,
            wpm,
            accuracy,
            duration,
            created_at,
            profiles!inner(username, avatar_url)
          `)
                    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
                    .order("wpm", { ascending: false })
                    .limit(3);

                if (!error && data && data.length > 0) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setEntries(data.map((d: any) => ({
                        id: d.id,
                        username: d.profiles?.username || "Anonymous",
                        avatar_url: d.profiles?.avatar_url,
                        wpm: d.wpm,
                        accuracy: d.accuracy,
                        duration: d.duration,
                        created_at: d.created_at,
                    })));
                } else {
                    // Clear entries if empty or error to avoid stale data
                    setEntries([]);
                }
            } catch (err) {
                console.log("Failed to fetch leaderboard:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchLeaderboard();
    }, [isSignedIn, refreshTrigger]);

    const getRankStyles = (index: number) => {
        if (index === 0) {
            return {
                container: "bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/10 hover:border-yellow-500/30",
                rank: "text-yellow-600 dark:text-yellow-500",
                wpm: "text-amber-700 dark:text-yellow-400",
            };
        }
        return {
            container: "hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-white/5",
            rank: index === 2 ? "text-orange-600 dark:text-amber-700" : "text-slate-700 dark:text-slate-400",
            wpm: "text-black dark:text-slate-200",
        };
    };

    return (
        <section className="animate-enter delay-300 w-full glass-card rounded-2xl p-6 border-t border-cyan-500/20">
            <h3 className="text-sm font-medium text-'#e2e8f0' dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <iconify-icon icon="solar:cup-star-linear" class="text-orange-500 dark:text-yellow-400"></iconify-icon>
                Monthly Top 3
            </h3>

            {!isSignedIn ? (
                // Guest user - show sign in prompt
                <div className="text-center py-8">
                    <iconify-icon icon="solar:lock-linear" class="text-slate-500 text-4xl mb-3"></iconify-icon>
                    <p className="text-slate-400 mb-4">Sign in to view the leaderboard</p>
                    <Link
                        href="/sign-in"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        <iconify-icon icon="solar:login-2-linear" width="18"></iconify-icon>
                        Sign In
                    </Link>
                </div>
            ) : loading ? (
                <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : entries.length === 0 ? (
                <div className="relative group overflow-hidden rounded-xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 p-6 text-center transition-all hover:border-yellow-500/40 hover:from-yellow-500/10 hover:to-amber-500/10">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay"></div>
                    <div className="relative z-10">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 ring-1 ring-yellow-500/30 group-hover:scale-110 transition-transform duration-500">
                            <iconify-icon icon="solar:crown-bold" class="text-2xl text-yellow-400"></iconify-icon>
                        </div>
                        <h4 className="text-lg font-bold text-yellow-100 mb-1">Chance to be #1</h4>
                        <p className="text-sm text-yellow-200/60 leading-relaxed">
                            The podium is empty this month. <br />
                            Set a record and claim the top spot!
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    {entries.map((entry, index) => {
                        const styles = getRankStyles(index);
                        return (
                            <div
                                key={entry.id}
                                className={`flex items-center justify-between p-3 rounded-lg ${styles.container} transition-all group cursor-pointer`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`${styles.rank} font-bold w-4`}>
                                        {index + 1}
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs overflow-hidden">
                                        <img src={entry.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`} alt="avatar" />
                                    </div>
                                    <span
                                        className="text-sm font-medium"
                                        style={{ color: theme === 'dark' ? '#e2e8f0' : '#000000' }}
                                    >
                                        {entry.username}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-slate-500 dark:text-slate-500 text-xs bg-slate-100 dark:bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/5 hidden sm:block">
                                        {entry.duration}s
                                    </span>
                                    <span className="text-slate-500 dark:text-slate-400 text-xs hidden sm:block">
                                        {entry.accuracy}% acc
                                    </span>
                                    <span
                                        className="font-mono font-semibold"
                                        style={{
                                            color: theme === 'dark'
                                                ? (index === 0 ? '#fbbf24' : '#e2e8f0')
                                                : (index === 0 ? '#b45309' : '#000000')
                                        }}
                                    >
                                        {entry.wpm} WPM
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
