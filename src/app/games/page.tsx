"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RainfallGame from "@/components/RainfallGame";
import { useState } from "react";

export default function GamesPage() {
    const [activeGame, setActiveGame] = useState<string | null>(null);

    return (
        <>
            <Header />

            <main className="flex-grow pt-28 pb-12 px-6 container mx-auto max-w-5xl">
                <section className="animate-enter">

                    {/* Header Section - Always visible unless in game */}
                    {!activeGame && (
                        <div className="flex items-center gap-3 mb-8">
                            <iconify-icon icon="solar:gamepad-bold-duotone" class="text-cyan-400 text-3xl"></iconify-icon>
                            <h1 className="text-3xl font-bold text-white">Typing Games</h1>
                        </div>
                    )}

                    {/* Game Cards List */}
                    {!activeGame && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            {/* WordsFall - Active */}
                            <div
                                onClick={() => setActiveGame('rainfall')}
                                className="glass-card rounded-2xl p-6 border-2 border-cyan-500/30 relative overflow-hidden cursor-pointer hover:border-cyan-400/50 hover:scale-[1.02] transition-all group"
                            >
                                <div className="absolute top-3 right-3">
                                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                                        Active
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <iconify-icon icon="solar:cloud-rain-bold-duotone" width="48" class="text-cyan-400 mb-4 group-hover:scale-110 transition-transform duration-300"></iconify-icon>
                                <h3 className="text-xl font-semibold text-white mb-2">WordsFall</h3>
                                <p className="text-slate-400 text-sm mb-4">
                                    Words fall from the sky! Type them before they hit the ground.
                                    Score points for speed and accuracy.
                                </p>
                                <div className="flex items-center gap-4 text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                                    <span className="flex items-center gap-1">
                                        <iconify-icon icon="solar:star-linear"></iconify-icon>
                                        Survival & Time Attack
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <iconify-icon icon="solar:fire-linear"></iconify-icon>
                                        Fast-paced
                                    </span>
                                </div>
                            </div>

                            {/* Coming Soon Cards */}
                            <div className="glass-card rounded-2xl p-6 opacity-50 relative overflow-hidden grayscale">
                                <div className="absolute top-3 right-3">
                                    <span className="px-2 py-1 rounded-full bg-slate-500/20 text-slate-400 text-xs font-medium">
                                        Coming Soon
                                    </span>
                                </div>
                                <iconify-icon icon="solar:target-bold-duotone" width="48" class="text-violet-400 mb-4"></iconify-icon>
                                <h3 className="text-xl font-semibold text-white mb-2">Word Hunter</h3>
                                <p className="text-slate-400 text-sm mb-4">
                                    Find and type hidden words in a grid before time runs out.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Active Game View */}
                    {activeGame === 'rainfall' && (
                        <div className="animate-enter">
                            <button
                                onClick={() => setActiveGame(null)}
                                className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                            >
                                <iconify-icon icon="solar:arrow-left-linear"></iconify-icon>
                                Back to Games
                            </button>
                            <RainfallGame />
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </>
    );
}
