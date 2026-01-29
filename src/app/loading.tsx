"use client";

import KeyLoader from "@/components/KeyLoader";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm transition-colors duration-300">
            <KeyLoader />

        </div>
    );
}
