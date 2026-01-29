"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { generateWords } from "@/lib/typingTest";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface FallingWord {
    id: number;
    text: string;
    x: number;
    y: number;
    speed: number;
}

type GameMode = "lives" | "time";

interface RainfallGameProps {
    onGameEnd?: (score: number) => void;
}

export default function RainfallGame({ onGameEnd }: RainfallGameProps) {
    const [words, setWords] = useState<FallingWord[]>([]);
    const [input, setInput] = useState("");
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeLeft, setTimeLeft] = useState(60);
    const [gameState, setGameState] = useState<"idle" | "playing" | "gameover" | "paused">("idle");
    const [level, setLevel] = useState(1);
    const [wordsTyped, setWordsTyped] = useState(0);
    const [isHit, setIsHit] = useState(false);

    // Trigger visual hit effect
    const triggerHitEffect = useCallback(() => {
        setIsHit(true);
        setTimeout(() => setIsHit(false), 300);
    }, []);


    const [gameMode, setGameMode] = useState<GameMode>("lives");
    const [initialLives, setInitialLives] = useState(3);
    const [initialTime, setInitialTime] = useState(60);

    const containerRef = useRef<HTMLDivElement>(null);
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const wordIdRef = useRef(0);
    const animationRef = useRef<number>(0);
    const lastSpawnRef = useRef(0);

    // Sound Effects
    const { playSound, isMuted, toggleMute } = useSoundEffects();

    // Load high score
    useEffect(() => {
        const saved = localStorage.getItem("wordsfall_highscore");
        if (saved) setHighScore(parseInt(saved));
    }, []);

    const getRandomWord = () => generateWords(1)[0];

    const spawnWord = useCallback(() => {
        const newWord: FallingWord = {
            id: wordIdRef.current++,
            text: getRandomWord(),
            x: Math.random() * 80 + 10, // 10-90% of width
            y: 0,
            // Slower initial speed
            speed: 0.05 + level * 0.05 + Math.random() * 0.1,
        };
        setWords((prev) => [...prev, newWord]);
    }, [level]);

    const toggleFullScreen = async () => {
        if (!document.fullscreenElement && containerRef.current) {
            try {
                await containerRef.current.requestFullscreen();
            } catch (err) {
                console.error("Error attempting to enable full-screen mode:", err);
            }
        } else if (document.fullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const startGame = () => {
        playSound("click");
        setWords([]);
        setInput("");
        setScore(0);
        setLives(gameMode === "lives" ? initialLives : 1); // 1 placeholder life for time mode (not really used)
        setTimeLeft(initialTime);
        setLevel(1);
        setWordsTyped(0);
        setGameState("playing");
        wordIdRef.current = 0;
        lastSpawnRef.current = Date.now();
        inputRef.current?.focus();

        // Auto enter full screen
        if (!document.fullscreenElement && containerRef.current) {
            containerRef.current.requestFullscreen().catch(err => console.log(err));
        }
    };

    const [startCountdown, setStartCountdown] = useState<number | null>(null);



    const togglePause = useCallback(() => {
        if (gameState === "playing") {
            setGameState("paused");
        } else if (gameState === "paused") {
            // Start resume countdown
            setStartCountdown(3);
            playSound("click", { volume: 0.8 });

            const interval = setInterval(() => {
                setStartCountdown((prev) => {
                    if (prev === null || prev <= 1) {
                        clearInterval(interval);
                        playSound("success", { volume: 0.6 });
                        setGameState("playing");
                        lastSpawnRef.current = Date.now(); // Reset spawn timer
                        // Focus will need to happen in render or useEffect
                        return null;
                    }
                    playSound("click", { volume: 0.8 });
                    return prev - 1;
                });
            }, 1000);
        }
    }, [gameState, playSound]);

    // Game loop
    useEffect(() => {
        if (gameState !== "playing") return;

        const gameLoop = () => {
            const now = Date.now();
            // Spawn new words - Slower start
            const spawnInterval = Math.max(2000 - level * 100, 800);

            if (now - lastSpawnRef.current > spawnInterval) {
                spawnWord();
                lastSpawnRef.current = now;
            }

            // Keep input focused (unless user is interacting with controls)
            const activeEl = document.activeElement;
            const isControlInteraction = activeEl instanceof HTMLElement && (
                activeEl.closest('button') ||
                activeEl.closest('a')
            );

            if (document.activeElement !== inputRef.current && !isControlInteraction) {
                inputRef.current?.focus();
            }

            // Move words down
            setWords((prev) => {
                const updated = prev.map((word) => ({
                    ...word,
                    y: word.y + word.speed,
                }));

                // Check for words that reached bottom
                const escaped = updated.filter((w) => w.y >= 100);

                if (escaped.length > 0) {
                    if (gameMode === "lives") {
                        setLives((l) => {
                            const newLives = l - escaped.length;
                            if (newLives <= 0) {
                                setGameState("gameover");
                                playSound("gameover");
                                onGameEnd?.(score);
                                // Save high score if needed
                                if (score > highScore) {
                                    setHighScore(score);
                                    localStorage.setItem("wordsfall_highscore", score.toString());
                                }
                            } else {
                                playSound("error"); // Lost life
                            }
                            return Math.max(0, newLives);
                        });
                    } else {
                        // Time mode: Score Penalty for missed words
                        setScore(prev => Math.max(0, prev - (escaped.length * 50)));
                        playSound("error");

                        // Optional: Visual feedback (could add a red flash state later)
                    }
                }

                return updated.filter((w) => w.y < 100);
            });

            animationRef.current = requestAnimationFrame(gameLoop);
        };

        animationRef.current = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(animationRef.current);
    }, [gameState, level, spawnWord, onGameEnd, score, highScore, gameMode, playSound]);

    // Timer for Time Mode
    useEffect(() => {
        if (gameState !== "playing" || gameMode !== "time") return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setGameState("gameover");
                    playSound("gameover");
                    onGameEnd?.(score);
                    // Save high score if needed
                    if (score > highScore) {
                        setHighScore(score);
                        localStorage.setItem("wordsfall_highscore", score.toString());
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, gameMode, score, highScore, onGameEnd, playSound]);

    // Exit fullscreen on game over or idle (cancel)
    useEffect(() => {
        if ((gameState === "gameover" || gameState === "idle") && document.fullscreenElement) {
            document.exitFullscreen().catch(console.error);
        }
    }, [gameState]);

    // Level up
    useEffect(() => {
        const newLevel = Math.floor(wordsTyped / 10) + 1;
        if (newLevel > level) {
            setLevel(newLevel);
            playSound("levelup");
        }
    }, [wordsTyped, level, playSound]);

    // Handle input with smart switching
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        const prevInput = input;

        // Basic keyclick
        if (value.length > prevInput.length) {
            playSound("click", { volume: 0.3 });
        }

        // 1. Check for Full Match first (highest priority)
        const matchedWord = words.find((w) => w.text === value);
        if (matchedWord) {
            setWords((prev) => prev.filter((w) => w.id !== matchedWord.id));
            const newScore = score + matchedWord.text.length * 10 + Math.floor((100 - matchedWord.y) / 10);
            setScore(newScore);
            setWordsTyped((prev) => prev + 1);
            setInput(""); // Clear input on success
            playSound("success");

            // Live Update High Score
            if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem("wordsfall_highscore", newScore.toString());
            }
            return;
        }

        // 2. Check if valid prefix for ANY word
        const isValidPrefix = words.some(w => w.text.startsWith(value));

        if (isValidPrefix) {
            setInput(value); // Continue typing normally
        } else {
            // 3. Smart Switch: If current input is invalid, check if the LAST typed char starts a new word
            // Only do this if we are adding characters (not backspacing)
            if (value.length > prevInput.length) {
                const lastChar = value.slice(-1);
                const isNewStart = words.some(w => w.text.startsWith(lastChar));

                if (isNewStart) {
                    setInput(lastChar); // Auto-switch to new word
                } else {
                    setInput(value); // Let user see their mistake (or blocking - but visually better to show)
                }
            } else {
                setInput(value); // Allow backspace
            }
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div
            ref={containerRef}
            className={`w-full mx-auto transition-all duration-300 ${typeof document !== 'undefined' && document.fullscreenElement
                ? "flex flex-col h-screen justify-center p-8 bg-slate-50 dark:bg-slate-950"
                : "max-w-4xl"
                }`}
        >
            {/* Header - Only visible when playing or gameover */}
            {gameState !== "idle" && (
                <div className="flex items-center justify-between mb-4 animate-enter">
                    <div className="flex items-center gap-4">
                        <div className="glass-card px-4 py-2 rounded-lg">
                            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase">Score</span>
                            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{score}</div>
                        </div>
                        <div className="glass-card px-4 py-2 rounded-lg">
                            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase">Best</span>
                            <div className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">{highScore}</div>
                        </div>
                        <div className="glass-card px-4 py-2 rounded-lg">
                            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase">Level</span>
                            <div className="text-2xl font-bold text-violet-500 dark:text-violet-400">{level}</div>
                        </div>
                        {/* Mode Specific Display */}
                        {gameMode === "lives" ? (
                            <div className="glass-card px-4 py-2 rounded-lg">
                                <span className="text-slate-500 dark:text-slate-400 text-xs uppercase">Lives</span>
                                <div className="text-2xl font-bold text-red-500 dark:text-red-400 flex gap-1">
                                    {Array.from({ length: initialLives }).map((_, i) => (
                                        <iconify-icon
                                            key={i}
                                            icon={i < lives ? "solar:heart-bold" : "solar:heart-linear"}
                                            class={i < lives ? "text-red-500" : "text-slate-600"}
                                        ></iconify-icon>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card px-4 py-2 rounded-lg">
                                <span className="text-slate-500 dark:text-slate-400 text-xs uppercase">Time</span>
                                <div className={`text-2xl font-bold ${timeLeft < 10 ? "text-red-500 dark:text-red-400 animate-pulse" : "text-slate-900 dark:text-white"}`}>
                                    {formatTime(timeLeft)}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={toggleMute}
                            className={`p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-white/5 ${isMuted ? "text-slate-500" : "text-cyan-400"}`}
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            <iconify-icon icon={isMuted ? "solar:volume-cross-bold" : "solar:volume-loud-bold"} width="20"></iconify-icon>
                        </button>
                        {(gameState === "playing" || gameState === "paused") && (
                            <button
                                onClick={togglePause}
                                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors border border-white/5"
                                title={gameState === "playing" ? "Pause Game" : "Resume Game"}
                            >
                                <iconify-icon icon={gameState === "playing" ? "solar:pause-bold" : "solar:play-bold"} width="20"></iconify-icon>
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setGameState("idle");
                                setWords([]);
                                setInput("");
                            }}
                            className="bg-slate-800/50 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 text-slate-400 hover:text-red-400 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                            title="End Game"
                        >
                            <iconify-icon icon="solar:stop-circle-bold" width="20"></iconify-icon>
                        </button>
                        <button
                            onClick={startGame}
                            className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium hover:opacity-90 transition-opacity"
                        >
                            Restart
                        </button>
                    </div>
                </div>
            )}

            {/* Game Area */}
            <div
                ref={gameAreaRef}
                className="relative glass-card rounded-2xl overflow-hidden transition-all duration-300 flex-grow"
                style={{ height: typeof document !== 'undefined' && document.fullscreenElement ? "auto" : "600px" }}
                onClick={() => {
                    if (gameState === "playing") inputRef.current?.focus();
                }}
            >
                {/* Background grid */}
                <div className="absolute inset-0 opacity-10">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-full h-px bg-slate-900 dark:bg-white"
                            style={{ top: `${(i + 1) * 10}%` }}
                        />
                    ))}
                </div>

                {/* Paused Overlay */}
                {gameState === "paused" && startCountdown === null && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center animate-enter">
                        <div className="bg-slate-900/90 border border-white/10 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
                            <iconify-icon icon="solar:pause-circle-bold" width="64" class="text-cyan-400 mb-4"></iconify-icon>
                            <h2 className="text-2xl font-bold text-white mb-2">Game Paused</h2>
                            <p className="text-slate-400 mb-6">Take a breather!</p>

                            <button
                                onClick={togglePause}
                                className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                            >
                                <iconify-icon icon="solar:play-bold"></iconify-icon>
                                Resume
                            </button>
                        </div>
                    </div>
                )}

                {/* Countdown Overlay */}
                {startCountdown !== null && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-40 flex items-center justify-center animate-enter">
                        <div className="text-8xl font-bold text-cyan-400 text-glow animate-pulse">
                            {startCountdown}
                        </div>
                    </div>
                )}

                {/* Danger zone (only relevant for lives mode) */}
                <div className={`absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t ${gameMode === "lives" ? "from-red-500/20" : "from-slate-500/10"} to-transparent transition-colors`} />

                {/* Hit Effect Overlay */}
                {isHit && (
                    <div className="absolute inset-0 pointer-events-none z-20 animate-flash-red bg-red-500/20"></div>
                )}

                {/* Falling words */}
                {words.map((word) => {
                    const isMatched = word.text.startsWith(input);
                    const matchLength = isMatched ? input.length : 0;

                    return (
                        <div
                            key={word.id}
                            className={`absolute px-3 py-1 rounded-lg border font-mono text-lg transition-all ${isMatched && input.length > 0
                                ? "bg-slate-800 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-110 z-10"
                                : "bg-slate-800/80 border-slate-700/50"
                                }`}
                            style={{
                                left: `${word.x}%`,
                                top: `${word.y}%`,
                                transform: "translateX(-50%)",
                            }}
                        >
                            {word.text.split("").map((char, i) => (
                                <span
                                    key={i}
                                    className={
                                        i < matchLength
                                            ? "text-green-400 font-bold" // Typed chars are green/bold
                                            : "text-slate-300"           // Untyped chars are dimmer
                                    }
                                >
                                    {char}
                                </span>
                            ))}
                        </div>
                    );
                })}

                {/* Game Over Overlay */}
                {gameState === "gameover" && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center flex-col">
                        <h2 className="text-4xl font-bold text-red-400 mb-4">Game Over!</h2>
                        <div className="flex gap-8 mb-6">
                            <div className="text-center">
                                <p className="text-slate-400 text-sm uppercase">Score</p>
                                <p className="text-3xl font-bold text-cyan-400">{score}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-slate-400 text-sm uppercase">Best</p>
                                <p className="text-3xl font-bold text-yellow-400">{highScore}</p>
                            </div>
                        </div>
                        <p className="text-slate-400 mb-6">Level {level} • {wordsTyped} words typed</p>
                        <button
                            onClick={startGame}
                            className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium text-lg hover:opacity-90 transition-opacity"
                        >
                            Play Again
                        </button>
                    </div>
                )}

                {/* Idle State / Settings */}
                {gameState === "idle" && (
                    <div className="absolute inset-0 flex items-center justify-center flex-col p-8">
                        {/* Controls visible in Idle */}
                        <div className="absolute top-4 right-4 flex gap-2">
                            <div className="glass-card px-3 py-1 rounded-lg flex items-center gap-2">
                                <span className="text-slate-400 text-xs uppercase">Best</span>
                                <span className="text-yellow-400 font-bold">{highScore}</span>
                            </div>
                            <button
                                onClick={toggleFullScreen}
                                className="p-2 rounded-lg glass-card hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                title="Toggle Fullscreen"
                            >
                                <iconify-icon icon="solar:maximize-square-linear" width="20"></iconify-icon>
                            </button>
                        </div>

                        <iconify-icon icon="solar:cloud-rain-bold-duotone" width="60" class="text-cyan-500 dark:text-cyan-400 mb-2"></iconify-icon>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">WordsFall</h2>

                        {/* Navigation to Typing Test */}
                        <Link
                            href="/"
                            className="bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 px-4 py-1.5 rounded-full text-xs font-medium border border-white/5 hover:border-cyan-400/30 transition-all mb-8 flex items-center gap-2"
                        >
                            <iconify-icon icon="solar:keyboard-linear"></iconify-icon>
                            Go to Typing Test
                        </Link>

                        {/* Mode Selection */}
                        <div className="flex gap-2 p-1 bg-slate-800/50 rounded-lg mb-6 border border-white/5">
                            <button
                                onClick={() => setGameMode("lives")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${gameMode === "lives"
                                    ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 border border-red-500/30"
                                    : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <iconify-icon icon="solar:heart-bold"></iconify-icon>
                                    Survival
                                </div>
                            </button>
                            <button
                                onClick={() => setGameMode("time")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${gameMode === "time"
                                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30"
                                    : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                <div className="flex flex-col items-start text-left">
                                    <div className="flex items-center gap-2">
                                        <iconify-icon icon="solar:hourglass-bold"></iconify-icon>
                                        Time Attack
                                    </div>
                                    <span className="text-[10px] opacity-70">-50 pts per miss</span>
                                </div>
                            </button>
                        </div>

                        {/* Options Selection */}
                        <div className="mb-8">
                            <p className="text-slate-400 text-xs uppercase text-center mb-3">
                                {gameMode === "lives" ? "Select Lives" : "Select Duration"}
                            </p>
                            <div className="flex gap-3">
                                {gameMode === "lives" ? (
                                    [1, 3, 5, 10].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => setInitialLives(num)}
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all border ${initialLives === num
                                                ? "bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/20 scale-110"
                                                : "bg-slate-800/50 text-slate-400 border-white/5 hover:border-white/20 hover:text-white"
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    ))
                                ) : (
                                    [30, 60, 120].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => setInitialTime(num)}
                                            className={`px-4 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all border ${initialTime === num
                                                ? "bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/20 scale-110"
                                                : "bg-slate-800/50 text-slate-400 border-white/5 hover:border-white/20 hover:text-white"
                                                }`}
                                        >
                                            {num}s
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        <button
                            onClick={startGame}
                            className={`px-10 py-4 rounded-xl font-bold text-xl hover:opacity-90 transition-all flex items-center gap-3 shadow-xl ${gameMode === "lives"
                                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-red-500/20"
                                : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-cyan-500/20"
                                }`}
                        >
                            <iconify-icon icon="solar:play-bold"></iconify-icon>
                            Start {gameMode === "lives" ? "Survival" : "Time Attack"}
                        </button>
                    </div>
                )}
            </div>

            {/* Input - Hidden but functional */}
            <div className="absolute opacity-0 pointer-events-none">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                        if (e.key === " " || e.code === "Space") {
                            e.preventDefault();
                            setInput("");
                        }
                    }}
                    disabled={gameState !== "playing"}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoFocus
                />
            </div>

            {/* Current Input Display (optional visual feedback) */}
            {gameState === "playing" && input.length > 0 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none">
                    <div className="px-4 py-2 rounded-full bg-slate-800/80 border border-white/10 text-white font-mono text-xl shadow-lg backdrop-blur-sm">
                        {input}
                        <span className="animate-pulse ml-1 opacity-50">|</span>
                    </div>
                </div>
            )}
        </div>
    );
}
