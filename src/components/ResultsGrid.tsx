"use client";

import { TestResult } from "@/hooks/useTypingTest";

interface ResultsGridProps {
    result: TestResult | null;
    previousWpm?: number;
    onRestart?: () => void;
}

export default function ResultsGrid({ result, previousWpm = 82, onRestart }: ResultsGridProps) {
    if (!result) return null;

    const wpmChange = result.wpm - previousWpm;
    const wpmChangePercent = Math.round((wpmChange / previousWpm) * 100);

    // Get top 3 problem keys
    const problemKeysSorted = Object.entries(result.problemKeys)
        .sort(([, a], [, b]) => b.errors - a.errors)
        .slice(0, 3);

    return (
        <section className="animate-enter delay-200 w-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <iconify-icon icon="solar:chart-square-linear" class="text-cyan-600 dark:text-cyan-400"></iconify-icon>
                    Your Result
                </h2>
                <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <iconify-icon icon="solar:share-linear" width="20"></iconify-icon>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {/* Main WPM Card */}
                <div className="glass-card col-span-1 md:col-span-2 lg:col-span-2 row-span-2 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                WPM
                            </p>
                            <h3 className="text-6xl md:text-7xl font-semibold text-slate-900 dark:text-white mt-2 tracking-tighter dark:text-glow">
                                {result.wpm}
                            </h3>
                            <p
                                className={`text-sm mt-2 font-medium inline-block px-2 py-0.5 rounded ${wpmChange >= 0
                                    ? "text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-400/10 dark:text-glow"
                                    : "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10"
                                    }`}
                            >
                                {wpmChange >= 0 ? "+" : ""}
                                {wpmChangePercent}% vs avg
                            </p>
                        </div>
                        <div className="w-full h-16 flex items-end gap-1 mt-4">
                            {/* Simulated mini bar chart */}
                            <div className="flex-1 bg-slate-200 dark:bg-white/5 rounded-t-sm h-[40%]"></div>
                            <div className="flex-1 bg-slate-200 dark:bg-white/5 rounded-t-sm h-[60%]"></div>
                            <div className="flex-1 bg-slate-200 dark:bg-white/5 rounded-t-sm h-[50%]"></div>
                            <div className="flex-1 bg-slate-200 dark:bg-white/5 rounded-t-sm h-[70%]"></div>
                            <div className="flex-1 bg-cyan-500 dark:bg-cyan-400 rounded-t-sm h-[90%] shadow-[0_0_15px_rgba(6,182,212,0.4)]"></div>
                            <div className="flex-1 bg-slate-200 dark:bg-white/5 rounded-t-sm h-[60%]"></div>
                        </div>
                    </div>
                </div>

                {/* Accuracy Card */}
                <div className="glass-card col-span-1 md:col-span-2 lg:col-span-2 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden">
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Accuracy
                        </p>
                        <h3 className="text-3xl font-semibold text-slate-900 dark:text-white mt-1">
                            {result.accuracy}%
                        </h3>
                    </div>
                    <div className="relative w-12 h-12">
                        <svg className="transform -rotate-90 w-12 h-12">
                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                className="text-slate-300 dark:text-slate-800"
                            />
                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray="125.6"
                                strokeDashoffset={125.6 - (125.6 * result.accuracy) / 100}
                                className="text-green-500"
                            />
                        </svg>
                        <iconify-icon
                            icon="solar:target-linear"
                            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-500 text-sm"
                        ></iconify-icon>
                    </div>
                </div>

                {/* Consistency Card */}
                <div className="glass-card col-span-1 md:col-span-2 lg:col-span-2 rounded-2xl p-5 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Consistency
                        </p>
                        <span className="text-lg font-semibold text-violet-600 dark:text-violet-400">
                            {result.consistency}%
                        </span>
                    </div>
                    {/* Simple SVG Sparkline */}
                    <svg
                        className="w-full h-10 overflow-visible"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M0,30 L10,25 L20,28 L30,15 L40,20 L50,10 L60,15 L70,5 L80,12 L90,8 L100,15"
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                        ></path>
                        <defs>
                            <linearGradient id="gradientViolet" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M0,30 L10,25 L20,28 L30,15 L40,20 L50,10 L60,15 L70,5 L80,12 L90,8 L100,15 V40 H0 Z"
                            fill="url(#gradientViolet)"
                            opacity="0.2"
                        ></path>
                    </svg>
                </div>

                {/* Time Card */}
                <div className="glass-card col-span-1 md:col-span-2 lg:col-span-2 rounded-2xl p-5 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Time
                        </p>
                        <iconify-icon icon="solar:clock-circle-linear" class="text-orange-500 dark:text-orange-400"></iconify-icon>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <h3 className="text-3xl font-semibold text-slate-900 dark:text-white">
                            {result.duration}
                        </h3>
                        <span className="text-sm text-slate-500">s</span>
                    </div>
                </div>

                {/* Problem Keys Map */}
                <div className="glass-card col-span-1 md:col-span-4 lg:col-span-6 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Problem Keys</p>
                        <button className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-white transition-colors">
                            View Details
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {problemKeysSorted.length > 0 ? (
                            problemKeysSorted.map(([key, data], index) => {
                                const colors = [
                                    { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
                                    { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" },
                                    { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400" },
                                ];
                                const color = colors[index] || colors[2];
                                return (
                                    <div key={key} className="flex flex-col items-center gap-1 group">
                                        <div
                                            className={`w-12 h-12 rounded-lg ${color.bg} border ${color.border} flex items-center justify-center ${color.text} font-mono text-xl font-bold group-hover:scale-105 transition-transform`}
                                        >
                                            {key.toUpperCase()}
                                        </div>
                                        <span className={`text-xs ${color.text}`}>
                                            {data.errors} {data.errors === 1 ? "error" : "errors"}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex items-center gap-2 text-green-400 text-sm">
                                <iconify-icon icon="solar:check-circle-linear" width="18"></iconify-icon>
                                <span>No problem keys - great job!</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={() => onRestart ? onRestart() : window.location.reload()}
                    className="bg-slate-100 hover:bg-white text-slate-900 px-6 py-2.5 rounded-lg font-medium text-sm transition-all shadow-lg shadow-white/5 flex items-center gap-2"
                >
                    Next Test
                    <iconify-icon icon="solar:arrow-right-linear"></iconify-icon>
                </button>
            </div>
        </section>
    );
}
