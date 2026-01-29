"use client";

import React from "react";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-300 border ${theme === "dark"
                    ? "bg-slate-800/50 text-yellow-400 border-white/5 hover:bg-slate-700/50"
                    : "bg-white text-orange-500 border-slate-200 hover:bg-slate-50 shadow-sm"
                }`}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
            <iconify-icon
                icon={theme === "dark" ? "solar:moon-stars-bold" : "solar:sun-2-bold"}
                width="20"
            ></iconify-icon>
        </button>
    );
}
