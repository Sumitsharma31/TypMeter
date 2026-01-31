"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";

import Link from "next/link";

export interface ScoreRecord {
    id: string;
    wpm: number;
    accuracy: number;
    consistency: number;
    duration: number;
    mode: "time" | "words";
    created_at: string;
}

interface PreviousScoresProps {
    onNewScore?: ScoreRecord;
}

const STORAGE_KEY = "typmeter_scores";
const MAX_SCORES = 5;

// Get scores from localStorage for guests
function getLocalScores(): ScoreRecord[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Save scores to localStorage for guests
function saveLocalScores(scores: ScoreRecord[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores.slice(0, MAX_SCORES)));
}

export default function PreviousScores({ onNewScore }: PreviousScoresProps) {
    const { isSignedIn, userId } = useAuth();
    const [scores, setScores] = useState<ScoreRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    // Load scores on mount
    useEffect(() => {
        async function loadScores() {
            setLoading(true);

            if (isSignedIn && isSupabaseConfigured) {
                // 1. Sync Guest Scores if any
                // (Skipping sync for now as we don't have a direct IPC channel. 
                //  Future: Implement API route for batch upload)
                const guestScores = getLocalScores();
                if (guestScores.length > 0) {
                    localStorage.removeItem(STORAGE_KEY);
                }


                // 2. Fetch from Supabase directly
                try {
                    // First get the profile ID for this Clerk user
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('clerk_id', userId)
                        .single();

                    if (profile) {
                        const { data, error } = await supabase
                            .from('test_results')
                            .select('*')
                            .eq('user_id', profile.id)
                            .order('created_at', { ascending: false })
                            .limit(MAX_SCORES);

                        if (error) {
                            console.error("Error fetching scores:", error);
                        }

                        if (data) {
                            setScores(data as unknown as ScoreRecord[]);
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch scores from Supabase:", err);
                }
            } else {
                // Load from localStorage for guests
                setScores(getLocalScores());
            }

            setLoading(false);
        }

        loadScores();
    }, [isSignedIn, userId]);

    // Handle new score directly
    useEffect(() => {
        if (!onNewScore) return;

        console.log("Adding new score:", onNewScore);

        setScores(prevScores => {
            // Check if this score is already in the list (by ID or exact timestamp)
            // Auth users send duplicate IDs sometimes if we are not careful (temporary ID vs actual DB ID)
            // But here we rely on the object passed from page.tsx props.

            // If we already have a score with this ID, don't add it again
            if (prevScores.some(s => s.id === onNewScore.id)) {
                return prevScores;
            }

            const newScores = [onNewScore, ...prevScores].slice(0, MAX_SCORES);
            return newScores;
        });

    }, [onNewScore]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <section className="w-full">
                <div className="flex items-center gap-2 mb-4">
                    <iconify-icon icon="solar:history-linear" class="text-violet-500 dark:text-violet-400"></iconify-icon>
                    <h2 className="text-lg font-semibold" style={{ color: theme === 'dark' ? '#e2e8f0' : '#36343487' }}>Your History</h2>
                </div>
                <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </section>
        );
    }

    if (scores.length === 0) {
        return (
            <section className="w-full">
                <div className="flex items-center gap-2 mb-4">
                    <iconify-icon icon="solar:history-linear" class="text-violet-500 dark:text-violet-400"></iconify-icon>
                    <h2 className="text-lg font-semibold" style={{ color: theme === 'dark' ? '#e2e8f0' : '#000000' }}>Your History</h2>
                    {!isSignedIn && (
                        <span className="text-xs text-slate-500 ml-2">(Stored locally)</span>
                    )}
                </div>
                <div className="glass-card rounded-xl p-8 text-center">
                    <iconify-icon icon="solar:ghost-linear" class="text-slate-500 text-4xl mb-2"></iconify-icon>
                    <p className="text-slate-400">No previous scores yet</p>
                    <p className="text-slate-500 text-sm mt-1">Complete a test to see your history</p>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <iconify-icon icon="solar:history-linear" class="text-violet-500 dark:text-violet-400"></iconify-icon>
                    <h2 className="text-lg font-semibold" style={{ color: theme === 'dark' ? '#e2e8f0' : '#000000' }}>Your History</h2>
                    {!isSignedIn && (
                        <span className="text-xs text-slate-500 ml-2">(Stored locally)</span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500">{scores.length} tests</span>
                    {isSignedIn && (
                        <Link href="/history" className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-1 transition-colors">
                            View All
                            <iconify-icon icon="solar:arrow-right-linear"></iconify-icon>
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {scores.map((score, index) => (
                    <div
                        key={score.id}
                        className={`glass-card rounded-xl p-4 relative overflow-hidden transition-all hover:scale-[1.02] hover:border-cyan-500/30 ${index === 0 ? "border-cyan-500/20" : ""
                            }`}
                    >
                        {/* Latest badge */}
                        {index === 0 && (
                            <div className="absolute top-2 right-2">
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                                    Latest
                                </span>
                            </div>
                        )}

                        {/* WPM */}
                        <div className="mb-3">
                            <div className="text-3xl font-bold" style={{ color: theme === 'dark' ? '#e2e8f0' : '#000000' }}>
                                {score.wpm}
                            </div>
                            <div className="text-xs font-medium uppercase tracking-wide" style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>WPM</div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex gap-4 text-sm">
                            <div>
                                <span className="font-medium" style={{ color: theme === 'dark' ? '#4ade80' : '#059669' }}>{score.accuracy}%</span>
                                <span className="text-slate-400 text-xs ml-1">acc</span>
                            </div>
                            <div>
                                <span className="font-medium" style={{ color: theme === 'dark' ? '#a78bfa' : '#4f46e5' }}>{score.consistency}%</span>
                                <span className="text-slate-400 text-xs ml-1">con</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-3 pt-2 border-t border-slate-200 dark:border-white/5 flex justify-between items-center">
                            <span className="text-xs text-slate-500">{formatDate(score.created_at)}</span>
                            <span className="text-xs text-slate-400">
                                {score.duration}s
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// Helper function to save a new score (call this from page.tsx)
export function saveGuestScore(score: Omit<ScoreRecord, "id" | "created_at">) {
    const newScore: ScoreRecord = {
        ...score,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
    };

    const scores = getLocalScores();
    const newScores = [newScore, ...scores].slice(0, MAX_SCORES);
    saveLocalScores(newScores);

    return newScore;
}
