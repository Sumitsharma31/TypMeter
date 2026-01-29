"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Leaderboard from "@/components/Leaderboard";

import { useTheme } from "@/hooks/useTheme";

export default function LeaderboardPage() {
    const { theme } = useTheme();
    return (
        <div
            className="flex flex-col min-h-screen transition-colors duration-300"
            style={{
                backgroundColor: theme === 'dark' ? '#020617' : '#f8fafc',
                color: theme === 'dark' ? '#e2e8f0' : '#0f172a'
            }}
        >
            <div
                className="fixed inset-0 -z-50 transition-opacity duration-300"
                style={{
                    background: theme === 'dark'
                        ? 'radial-gradient(ellipse at top, #0f172a, #020617, #000000)'
                        : 'radial-gradient(ellipse at top, #f1f5f9, #f8fafc, #ffffff)',
                    opacity: theme === 'dark' ? 1 : 0.8
                }}
            ></div>

            <Header />

            <main className="flex-grow pt-32 pb-20 px-6 container mx-auto max-w-2xl">
                <div className="animate-enter">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mb-2">
                        Leaderboard
                    </h1>
                    <p className="mb-8" style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                        Top scores from the last 24 hours. Compete for the crown!
                    </p>

                    <Leaderboard />
                </div>
            </main>

            <Footer />
        </div>
    );
}
