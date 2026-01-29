"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useTypingTest, TestResult } from "@/hooks/useTypingTest";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useTheme } from "@/hooks/useTheme";

type TestMode = "time" | "words";

interface TypingTestProps {
    duration: number;
    onComplete: (result: TestResult) => void;
    onDurationChange: (duration: number) => void;
}

export default function TypingTest({
    duration,
    onComplete,
    onDurationChange,
}: TypingTestProps) {
    const [mode, setMode] = useState<TestMode>("time");
    const [wordCount, setWordCount] = useState(25);
    const [showSettings, setShowSettings] = useState(false);
    const [includePunctuation, setIncludePunctuation] = useState(false);
    const [includeNumbers, setIncludeNumbers] = useState(false);
    const [isError, setIsError] = useState(false);

    const {
        words,
        currentWordIndex,
        currentCharIndex,
        isActive,
        isComplete,
        timeRemaining,
        currentWpm,
        currentAccuracy,
        errors,
        handleInput,
        handleSpace,
        handleBackspace,
        reset,
        isPaused,
        togglePause,
        pause,
        resume,
        start,
    } = useTypingTest({ duration, onComplete, includePunctuation, includeNumbers });

    const { playSound, isMuted, toggleMute } = useSoundEffects();
    const [startCountdown, setStartCountdown] = useState<number | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { theme } = useTheme();

    // Ensure we clear interval on unmount
    useEffect(() => {
        return () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
        };
    }, []);

    // Play beep
    const playBeep = () => {
        // We can reuse 'click' or 'success' or implement a custom beep if needed.
        // For now, let's try 'click' for countdown ticks.
        playSound("click", { volume: 0.8 });
    };

    // Generic countdown sequence
    // Generic countdown sequence
    const startCountdownSequence = (onComplete: () => void) => {
        // Clear any existing interval first
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
        }

        setStartCountdown(3);
        playBeep();

        const interval = setInterval(() => {
            setStartCountdown((prev) => {
                // If we were cancelled (prev null) or reached 1
                // Note: If cancelled via handleCancel, we explicitly set null and clear interval there.
                // But if we just rely on state here:
                if (prev === null) {
                    // Should theoretically not happen if we clear interval in handleCancel
                    clearInterval(interval);
                    return null;
                }

                if (prev <= 1) {
                    clearInterval(interval);
                    countdownIntervalRef.current = null;
                    playSound("success", { volume: 0.6 });
                    onComplete();
                    return null;
                }
                playBeep();
                return prev - 1;
            });
        }, 1000);

        countdownIntervalRef.current = interval;
    };

    const handleStartOrResume = () => {
        // Focus immediately to avoid browser blocking
        inputRef.current?.focus();

        if (!isActive) {
            // Start fresh
            startCountdownSequence(() => {
                start(); // Explicitly start the test logic
                // Focus is already set, but no harm ensuring it
                inputRef.current?.focus();
            });
        } else if (isPaused) {
            // Resume
            startCountdownSequence(() => {
                resume();
                // Focus is already set
            });
        } else {
            // Pause immediately (no countdown)
            pause();
        }
    };

    const handleCancel = () => {
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        setStartCountdown(null);
        reset();
    };

    const handleRestart = () => {
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        reset();
        setStartCountdown(null); // Ensure UI clears immediately
        startCountdownSequence(() => {
            start();
        });
    };

    // Play success sound on completion
    useEffect(() => {
        if (isComplete) {
            playSound("success");
        }
    }, [isComplete, playSound]);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);

    // Close settings when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
                setShowSettings(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        // Initial focus
        setTimeout(() => inputRef.current?.focus(), 50);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus input on click
    const handleContainerClick = useCallback(() => {
        inputRef.current?.focus();
    }, []);

    // Handle keyboard input
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === " ") {
                e.preventDefault();
                playSound("click");
                handleSpace();
            } else if (e.key === "Backspace") {
                e.preventDefault();
                playSound("click", { volume: 0.4 }); // Softer click for backspace
                handleBackspace();
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();

                // Simple prediction for visual feedback
                const currentWord = words[currentWordIndex];
                const expectedChar = currentWord ? currentWord[currentCharIndex] : null;
                const isCorrect = expectedChar === e.key;

                if (!isCorrect && expectedChar) {
                    setIsError(true);
                    setTimeout(() => setIsError(false), 200);
                }

                playSound("click");
                handleInput(e.key);
            }
        },
        [handleSpace, handleBackspace, handleInput, playSound, words, currentWordIndex, currentCharIndex]
    );

    // Reset when duration or mode changes
    useEffect(() => {
        reset();
        // Force focus on reset/mode change
        setTimeout(() => inputRef.current?.focus(), 10);
    }, [duration, mode, wordCount, reset]);

    // Check if test should complete in words mode
    const isWordsComplete = mode === "words" && currentWordIndex >= wordCount;

    // Render words with character highlighting
    // Show 15 words per "row" - only advance when the row is completed
    const renderWords = () => {
        const WORDS_PER_ROW = 40;
        const currentRow = Math.floor(currentWordIndex / WORDS_PER_ROW);
        const startIdx = currentRow * WORDS_PER_ROW;
        const endIdx = mode === "words"
            ? Math.min(wordCount, startIdx + WORDS_PER_ROW)
            : startIdx + WORDS_PER_ROW;
        const visibleWords = words.slice(startIdx, endIdx);

        return visibleWords.map((word, idx) => {
            const wordIdx = startIdx + idx;
            const isCurrentWord = wordIdx === currentWordIndex;
            const isPastWord = wordIdx < currentWordIndex;

            // In words mode, hide words beyond the limit
            if (mode === "words" && wordIdx >= wordCount) return null;

            return (
                <span key={wordIdx} className="mr-3 inline-block whitespace-nowrap">
                    {word.split("").map((char, charIdx) => {
                        let className = "text-slate-400 dark:text-slate-600 transition-colors duration-100";
                        const errorKey = `${wordIdx}-${charIdx}`;

                        if (isPastWord) {
                            className = errors.has(errorKey)
                                ? "text-red-400"
                                : "text-slate-500";
                        } else if (isCurrentWord) {
                            if (charIdx < currentCharIndex) {
                                className = errors.has(errorKey)
                                    ? "text-red-500 dark:text-red-400 border-b-2 border-red-500/50"
                                    : "text-slate-400 dark:text-slate-400";
                            } else if (charIdx === currentCharIndex) {
                                className =
                                    "text-cyan-400 border-l-[3px] border-cyan-400 pl-[1px] animate-pulse";
                            }
                        }

                        return (
                            <span key={charIdx} className={className}>
                                {char}
                            </span>
                        );
                    })}
                </span>
            );
        });
    };

    const timeOptions = [15, 30, 60];
    const wordOptions = [10, 25, 50, 100];

    return (
        <section className="animate-enter flex flex-col items-center w-full">
            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between w-full max-w-4xl mb-8 gap-4 glass-card p-2 rounded-xl">
                <div className="flex items-center gap-2 px-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                        Mode
                    </span>
                    <button
                        onClick={() => setMode("time")}
                        className={`text-sm font-medium transition-colors flex items-center gap-1 ${mode === "time"
                            ? "text-cyan-400 hover:text-cyan-300"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        <iconify-icon icon="solar:clock-circle-linear" width="16"></iconify-icon>
                        Time
                    </button>
                    <span className="text-slate-700">|</span>
                    <button
                        onClick={() => setMode("words")}
                        className={`text-sm font-medium transition-colors flex items-center gap-1 ${mode === "words"
                            ? "text-cyan-400 hover:text-cyan-300"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        <iconify-icon icon="solar:document-text-linear" width="16"></iconify-icon>
                        Words
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-100 dark:bg-slate-900/50 rounded-lg p-1">
                        {mode === "time"
                            ? timeOptions.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => onDurationChange(d)}
                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${duration === d
                                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                >
                                    {d}s
                                </button>
                            ))
                            : wordOptions.map((w) => (
                                <button
                                    key={w}
                                    onClick={() => setWordCount(w)}
                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${wordCount === w
                                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                >
                                    {w}
                                </button>
                            ))}
                    </div>

                    {/* Settings Button */}
                    <div className="relative" ref={settingsRef}>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${showSettings
                                ? "bg-slate-700 text-white"
                                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                }`}
                        >
                            <iconify-icon icon="solar:settings-linear" width="16"></iconify-icon>
                        </button>

                        {/* Settings Dropdown */}
                        {showSettings && (
                            <div className="absolute right-0 top-full mt-2 w-56 glass-card rounded-xl p-4 z-50 shadow-xl border border-white/10">
                                {/* ... settings content ... */}
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                    Settings
                                </h4>

                                {/* ... (keep existing settings content) ... */}
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                            Sound
                                        </span>
                                        <button
                                            onClick={toggleMute}
                                            className={`w-10 h-5 rounded-full transition-colors ${!isMuted ? "bg-cyan-500" : "bg-slate-700"}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${!isMuted ? "translate-x-5" : "translate-x-0.5"}`} />
                                        </button>
                                    </label>

                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                            Numbers
                                        </span>
                                        <button
                                            onClick={() => setIncludeNumbers(!includeNumbers)}
                                            className={`w-10 h-5 rounded-full transition-colors ${includeNumbers ? "bg-cyan-500" : "bg-slate-700"}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${includeNumbers ? "translate-x-5" : "translate-x-0.5"}`} />
                                        </button>
                                    </label>

                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                            Punctuation
                                        </span>
                                        <button
                                            onClick={() => setIncludePunctuation(!includePunctuation)}
                                            className={`w-10 h-5 rounded-full transition-colors ${includePunctuation ? "bg-cyan-500" : "bg-slate-700"}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${includePunctuation ? "translate-x-5" : "translate-x-0.5"}`} />
                                        </button>
                                    </label>

                                    <div className="pt-2 border-t border-white/10">
                                        <button
                                            onClick={() => {
                                                reset();
                                                setShowSettings(false);
                                            }}
                                            className="w-full py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-sm text-slate-300 hover:text-white transition-colors"
                                        >
                                            Reset Test
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>


            {/* Stats Overlay (Live) */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-xs mb-6 opacity-80">
                <div className="text-center">
                    <div className="text-2xl font-sans font-semibold text-cyan-400">
                        {currentWpm}
                    </div>
                    <div className="text-xs uppercase tracking-tight" style={{ color: theme === 'dark' ? '#64748b' : '#6b7280' }}>
                        wpm
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-sans font-semibold" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                        {currentAccuracy}%
                    </div>
                    <div className="text-xs uppercase tracking-tight" style={{ color: theme === 'dark' ? '#64748b' : '#6b7280' }}>
                        acc
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-sans font-semibold text-violet-400">
                        {mode === "time" ? timeRemaining : `${currentWordIndex}/${wordCount}`}
                    </div>
                    <div className="text-xs uppercase tracking-tight" style={{ color: theme === 'dark' ? '#64748b' : '#6b7280' }}>
                        {mode === "time" ? "time" : "words"}
                    </div>
                </div>
            </div>

            {/* Typing Area */}
            <div
                ref={containerRef}
                onClick={handleContainerClick}
                className={`relative w-full max-w-4xl min-h-[200px] group cursor-text ${isError ? "animate-shake" : ""}`}
            >
                {/* Focus Indicator */}
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Hidden Input */}
                <input
                    ref={inputRef}
                    type="text"
                    className="absolute opacity-0 w-0 h-0"
                    onKeyDown={(e) => {
                        if (startCountdown !== null) {
                            e.preventDefault();
                            return;
                        }
                        handleKeyDown(e);
                    }}
                    autoFocus
                    disabled={isComplete || isWordsComplete}
                    readOnly={startCountdown !== null}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                />

                {/* Words Display */}
                <div
                    className="relative z-10 font-mono text-2xl md:text-3xl leading-relaxed break-words outline-none select-none text-left"
                    tabIndex={0}
                >
                    {isComplete || isWordsComplete ? (
                        <div className="text-center py-8">
                            <div className="text-4xl font-semibold text-cyan-400 text-glow mb-2">
                                Test Complete!
                            </div>
                            <div className="text-slate-400">
                                Check your results below
                            </div>
                        </div>
                    ) : (
                        renderWords()
                    )}
                </div>

                {/* Countdown Overlay */}
                {startCountdown !== null && (
                    <div
                        className="absolute inset-0 z-30 flex items-center justify-center animate-enter rounded-lg backdrop-blur-sm transition-colors duration-300"
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)'
                        }}
                    >
                        <div
                            className="text-8xl font-bold animate-pulse"
                            style={{
                                color: theme === 'dark' ? '#22d3ee' : '#0891b2', // cyan-400 : cyan-600
                                textShadow: theme === 'dark' ? '0 0 30px rgba(34, 211, 238, 0.5)' : 'none'
                            }}
                        >
                            {startCountdown}
                        </div>
                    </div>
                )}

                {/* Paused Overlay */}
                {isPaused && startCountdown === null && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-20 flex flex-col items-center justify-center animate-enter rounded-lg">
                        <iconify-icon icon="solar:pause-circle-bold" width="48" class="text-cyan-400 mb-4"></iconify-icon>
                        <h3 className="text-xl font-bold text-white mb-2">Paused</h3>
                        <p className="text-slate-400 text-sm mb-6">Click to resume</p>
                        <button
                            onClick={handleStartOrResume}
                            className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium hover:opacity-90 transition-opacity"
                        >
                            Resume
                        </button>
                    </div>
                )}

                {/* Restart Button */}
                {/* Bottom Controls */}
                <div className="mt-12 flex justify-center gap-4">
                    {/* Start/Pause/Resume Button */}
                    {!isComplete && (
                        <button
                            onClick={() => {
                                if (startCountdown === null) {
                                    handleStartOrResume();
                                }
                            }}
                            className={`group relative px-6 py-2 rounded-lg border transition-all duration-300 ${!isActive && startCountdown === null
                                ? "bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20"
                                : isPaused
                                    ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
                                    : "bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20"
                                }`}
                            disabled={startCountdown !== null}
                        >
                            <span className={`relative flex items-center gap-2 text-sm font-medium ${!isActive && startCountdown === null
                                ? "text-cyan-400 group-hover:text-cyan-300"
                                : isPaused
                                    ? "text-green-400 group-hover:text-green-300"
                                    : "text-yellow-400 group-hover:text-yellow-300"
                                }`}>
                                <iconify-icon icon={
                                    !isActive ? "solar:play-bold"
                                        : isPaused ? "solar:play-bold"
                                            : "solar:pause-bold"
                                } width="18"></iconify-icon>
                                {startCountdown !== null ? `Starting in ${startCountdown}...` : !isActive ? "Start Test" : isPaused ? "Resume" : "Pause"}
                            </span>
                        </button>
                    )}

                    {/* Cancel Button */}
                    {(isActive || startCountdown !== null) && (
                        <button
                            onClick={handleCancel}
                            className="group relative px-6 py-2 rounded-lg bg-slate-800/50 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 transition-all duration-300"
                        >
                            <span className="relative flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-red-500 dark:group-hover:text-red-400">
                                <iconify-icon icon="solar:stop-circle-bold" width="18"></iconify-icon>
                                Cancel
                            </span>
                        </button>
                    )}

                    <button
                        onClick={handleRestart}
                        className="group relative px-6 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/5 hover:border-cyan-500/30 transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-cyan-400/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="relative flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-white">
                            <iconify-icon icon="solar:restart-linear" width="18"></iconify-icon>
                            Restart Test
                        </span>
                    </button>
                </div>
            </div>
        </section >
    );
}
