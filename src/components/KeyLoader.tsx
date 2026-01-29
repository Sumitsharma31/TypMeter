"use client";

import React from "react";

export default function KeyLoader() {
    return (
        <div className="flex items-center gap-3">
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="w-12 h-12 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-[0_4px_0_0_rgba(203,213,225,1)] dark:shadow-[0_4px_0_0_rgba(30,41,59,0.5)] flex items-center justify-center animate-keypress"
                    style={{
                        animationDelay: `${i * 150}ms`,
                    }}
                >
                    <div className="w-2 h-2 rounded-full bg-cyan-500/50 dark:bg-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.5)] dark:shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                </div>
            ))}
        </div>
    );
}
