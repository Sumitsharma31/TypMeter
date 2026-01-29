"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { useTheme } from "@/hooks/useTheme";

export default function AboutPage() {
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

            <main className="flex-grow pt-28 pb-12 px-6 container mx-auto max-w-4xl">
                <section className="animate-enter">
                    <h1 className="text-4xl font-bold mb-6 flex items-center gap-3" style={{ color: theme === 'dark' ? '#ffffff' : '#0f172a' }}>
                        <iconify-icon icon="solar:info-circle-linear" class="text-cyan-400"></iconify-icon>
                        About TypMeter
                    </h1>

                    <div className={`rounded-2xl p-8 space-y-6 transition-colors duration-300 ${theme === 'dark' ? 'glass-card' : 'bg-white border border-slate-200 shadow-sm'
                        }`}>
                        <div>
                            <h2 className="text-xl font-semibold mb-3" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>What is TypMeter?</h2>
                            <p className="leading-relaxed" style={{ color: theme === 'dark' ? '#cbd5e1' : '#475569' }}>
                                TypMeter is a modern, sleek typing speed test application designed to help you
                                measure and improve your typing skills. With real-time WPM (Words Per Minute)
                                tracking, accuracy measurement, and detailed analytics, you can track your
                                progress and become a faster, more accurate typist.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-3" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>Features</h2>
                            <ul className="space-y-2" style={{ color: theme === 'dark' ? '#cbd5e1' : '#475569' }}>
                                <li className="flex items-start gap-2">
                                    <iconify-icon icon="solar:check-circle-linear" class="text-cyan-400 mt-1"></iconify-icon>
                                    <span><strong style={{ color: theme === 'dark' ? '#ffffff' : '#334155' }}>Real-time Stats</strong> - See your WPM, accuracy, and time as you type</span>
                                </li>
                            </ul>
                            <p className="text-lg max-w-2xl mx-auto mb-16 leading-relaxed" style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                                A modern typing platform designed to help you improve your speed and accuracy through clean aesthetics and engaging game modes.
                            </p>

                            <div className="grid md:grid-cols-2 gap-8 mb-16 text-left">
                                <div className={`p-8 rounded-2xl border transition-colors duration-300 ${theme === 'dark' ? 'glass-card border-white/5' : 'bg-slate-50 border-slate-200'
                                    }`}>
                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 text-cyan-400">
                                        <iconify-icon icon="solar:rocket-bold-duotone" width="28"></iconify-icon>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>The Mission</h3>
                                    <p className="leading-relaxed" style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                                        To create the most beautiful and responsive typing experience on the web. typMeter focuses on minimalism and performance, stripping away distractions so you can focus purely on your typing flow.
                                    </p>
                                </div>

                                <div className={`p-8 rounded-2xl border transition-colors duration-300 ${theme === 'dark' ? 'glass-card border-white/5' : 'bg-slate-50 border-slate-200'
                                    }`}>
                                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6 text-violet-400">
                                        <iconify-icon icon="solar:code-bold-duotone" width="28"></iconify-icon>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>Open Source</h3>
                                    <p className="leading-relaxed" style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                                        Built with modern web technologies like Next.js and Tailwind CSS. We believe in transparency and community-driven development.
                                    </p>
                                </div>
                            </div>

                            {/* Personalized Creator Section */}
                            <div className={`p-8 rounded-2xl border max-w-sm mx-auto transform hover:scale-105 transition-all duration-300 ${theme === 'dark' ? 'glass-card border-white/5' : 'bg-slate-50 border-slate-200 shadow-md'
                                }`}>
                                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20">
                                    <span className="text-2xl font-bold text-white">S</span>
                                </div>
                                <h3 className="text-xl font-bold mb-1" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>Sumit Sharma</h3>
                                <p className="text-cyan-400 text-sm font-medium mb-4">Creator & Developer</p>
                                <p className="text-sm mb-6" style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                                    "I built TypMeter to make typing practice something you actually look forward to."
                                </p>
                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-sm flex items-center justify-center gap-2" style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                                        Built with ❤️ and ☕ by Sumit
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
