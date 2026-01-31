"use client";
import { SignIn } from "@clerk/clerk-react";
import Link from "next/link";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="relative">
                {/* Close button - simple clean icon */}
                <Link
                    href="/"
                    className="absolute top-2 right-2 z-50 p-1 hover:opacity-70 transition-opacity"
                >
                    <iconify-icon
                        icon="solar:close-circle-bold"
                        width="28"
                        class="text-slate-400"
                    ></iconify-icon>
                </Link>

                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "glass-card",
                            headerTitle: "text-white",
                            headerSubtitle: "text-slate-400",
                            socialButtonsBlockButton: "!bg-white hover:!bg-slate-200 border border-transparent transition-all duration-200",
                            socialButtonsBlockButtonText: "!text-slate-900 !font-semibold",
                            dividerLine: "bg-white/10",
                            dividerText: "text-slate-400",
                            formFieldLabel: "text-slate-300",
                            formFieldInput: "bg-black/20 border-white/10 text-white placeholder:text-slate-500",
                            footerActionText: "text-slate-400",
                            footerActionLink: "text-cyan-400 hover:text-cyan-300",
                        },
                    }}
                />
            </div>
        </div>
    );
}
