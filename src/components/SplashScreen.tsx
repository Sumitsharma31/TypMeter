"use client";

import React, { useEffect, useState } from "react";
import KeyLoader from "./KeyLoader";

export default function SplashScreen() {
    const [show, setShow] = useState(true);

    useEffect(() => {
        // Show splash screen on mount logic
        // We want it to show for at least 2 seconds for effect, 
        // but only on the very first load or refresh.

        const timer = setTimeout(() => {
            setShow(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 animate-fade-out" style={{ animationDelay: '1.8s', animationFillMode: 'forwards' }}>
            <div className="scale-150 mb-8">
                <KeyLoader />
            </div>
            <h1 className="text-2xl font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-400 text-glow animate-pulse">
                TypMeter
            </h1>
            <p className="mt-2 text-xs text-slate-500 font-mono">System Initializing...</p>
        </div>
    );
}
