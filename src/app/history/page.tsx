"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { ScoreRecord } from "@/components/PreviousScores";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import dynamic from "next/dynamic";

const HistoryChart = dynamic(() => import("@/components/HistoryChart"), { ssr: false });

export default function HistoryPage() {
    const { isSignedIn, userId, isLoaded } = useAuth();
    const [scores, setScores] = useState<ScoreRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !isSignedIn || !isSupabaseConfigured) {
            setLoading(false);
            return;
        }

        async function fetchAllScores() {
            setLoading(true);
            try {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("clerk_id", userId)
                    .single();

                if (profile) {
                    const { data } = await supabase
                        .from("test_results")
                        .select("*")
                        .eq("user_id", profile.id)
                        .order("created_at", { ascending: false })
                        .limit(100); // Fetch last 100 for now

                    if (data) {
                        setScores(data.map((d) => ({
                            id: d.id,
                            wpm: d.wpm,
                            accuracy: d.accuracy,
                            consistency: d.consistency || 0,
                            duration: d.duration,
                            mode: d.duration > 0 ? "time" : "words",
                            created_at: d.created_at,
                        })));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch history:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchAllScores();
    }, [isLoaded, isSignedIn, userId]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isSignedIn) {
        return (
            <>
                <Header />
                <main className="flex-grow pt-32 pb-12 px-6 flex flex-col items-center justify-center container mx-auto text-center gap-6 min-h-[60vh]">
                    <iconify-icon icon="solar:lock-keyhole-linear" class="text-6xl text-slate-600"></iconify-icon>
                    <h1 className="text-3xl font-bold text-white">Sign In Required</h1>
                    <p className="text-slate-400 max-w-md">
                        You need to be signed in to view your detailed history and analytics.
                    </p>
                    <Link
                        href="/sign-in"
                        className="px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition-colors"
                    >
                        Sign In
                    </Link>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="flex-grow pt-28 pb-12 px-6 flex flex-col gap-8 container mx-auto max-w-5xl">

                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My History</h1>
                        <p className="text-slate-400">Detailed analytics of your typing journey.</p>
                    </div>
                </div>

                {/* Premium Chart Section */}
                <section className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 z-20">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-xs font-medium text-yellow-400">
                            <iconify-icon icon="solar:crown-star-bold"></iconify-icon>
                            Premium Analytics
                        </span>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute -left-10 -top-10 w-60 h-60 bg-cyan-500/5 rounded-full blur-3xl"></div>

                    <h2 className="text-lg font-semibold text-white mb-1 relative z-10 flex items-center gap-2">
                        <iconify-icon icon="solar:graph-new-linear" class="text-cyan-400"></iconify-icon>
                        WPM Progress
                    </h2>

                    {loading ? (
                        <div className="h-[300px] flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : scores.length > 1 ? (
                        <HistoryChart data={scores} />
                    ) : (
                        <div className="h-[300px] flex flex-col items-center justify-center text-slate-500">
                            <iconify-icon icon="solar:chart-square-linear" class="text-4xl mb-2 opacity-50"></iconify-icon>
                            <p>Not enough data to generate chart.</p>
                            <p className="text-sm">Complete a few more tests!</p>
                        </div>
                    )}
                </section>

                {/* Detailed List */}
                <section>
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <iconify-icon icon="solar:list-check-linear" class="text-violet-400"></iconify-icon>
                        Recent Tests
                    </h2>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : scores.length === 0 ? (
                        <div className="glass-card p-12 text-center rounded-2xl">
                            <p className="text-slate-400">No test history found.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {/* Table Header (Visible on md+) */}
                            <div className="hidden md:grid grid-cols-5 px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <div>Date</div>
                                <div>WPM</div>
                                <div>Accuracy</div>
                                <div>Mode</div>
                                <div className="text-right">Consistency</div>
                            </div>

                            {scores.map((score) => (
                                <div
                                    key={score.id}
                                    className="glass-card p-4 md:px-6 md:py-4 rounded-xl flex flex-col md:grid md:grid-cols-5 items-center gap-4 transition-all hover:bg-white/5 group border border-transparent hover:border-white/10"
                                >
                                    {/* Mobile wrapper for header info */}
                                    <div className="w-full md:w-auto flex justify-between md:block">
                                        <div className="text-slate-300 text-sm md:text-base">
                                            {formatDate(score.created_at)}
                                        </div>
                                    </div>

                                    <div className="w-full md:w-auto flex justify-between md:block">
                                        <span className="md:hidden text-slate-500 text-sm">WPM</span>
                                        <div className="text-2xl md:text-xl font-bold text-white text-glow group-hover:text-cyan-400 transition-colors">
                                            {score.wpm}
                                        </div>
                                    </div>

                                    <div className="w-full md:w-auto flex justify-between md:block">
                                        <span className="md:hidden text-slate-500 text-sm">Accuracy</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-full max-w-[80px] h-1.5 bg-slate-800 rounded-full overflow-hidden hidden md:block">
                                                <div
                                                    className="h-full bg-green-500 rounded-full"
                                                    style={{ width: `${score.accuracy}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-green-400 font-medium">{score.accuracy}%</span>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-auto flex justify-between md:block">
                                        <span className="md:hidden text-slate-500 text-sm">Mode</span>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-400 border border-slate-700">
                                                {score.mode} {score.duration}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-auto flex justify-between md:block text-right">
                                        <span className="md:hidden text-slate-500 text-sm">Consistency</span>
                                        <span className="text-violet-400 font-medium">{score.consistency}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </>
    );
}
