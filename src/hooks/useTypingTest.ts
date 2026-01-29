"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
    generateWords,
    calculateWPM,
    calculateAccuracy,
    calculateConsistency,
    GenerateWordsOptions,
} from "@/lib/typingTest";

export interface TestResult {
    wpm: number;
    accuracy: number;
    consistency: number;
    duration: number;
    problemKeys: Record<string, { errors: number; avgTime: number }>;
}

interface UseTypingTestProps {
    duration: number; // in seconds
    onComplete?: (result: TestResult) => void;
    includePunctuation?: boolean;
    includeNumbers?: boolean;
}

export function useTypingTest({ duration, onComplete, includePunctuation = false, includeNumbers = false }: UseTypingTestProps) {
    const [words, setWords] = useState<string[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [input, setInput] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(duration);
    const [correctChars, setCorrectChars] = useState(0);
    const [totalChars, setTotalChars] = useState(0);
    const [errors, setErrors] = useState<Set<string>>(new Set());
    const [wpmHistory, setWpmHistory] = useState<number[]>([]);
    const [problemKeys, setProblemKeys] = useState<
        Record<string, { errors: number; avgTime: number }>
    >({});

    const startTimeRef = useRef<number | null>(null);
    const lastKeyTimeRef = useRef<number>(0);

    // Initialize words
    useEffect(() => {
        setWords(generateWords(100, { includePunctuation, includeNumbers }));
    }, [includePunctuation, includeNumbers]);

    // Pause and Resume
    const pause = useCallback(() => {
        if (!isActive || isComplete) return;
        setIsPaused(true);
    }, [isActive, isComplete]);

    const resume = useCallback(() => {
        if (!isActive || isComplete) return;
        setIsPaused(false);
    }, [isActive, isComplete]);

    // Toggle Pause (legacy/convenience)
    const togglePause = useCallback(() => {
        if (isPaused) {
            resume();
        } else {
            pause();
        }
    }, [isPaused, resume, pause]);

    // Timer
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && !isPaused && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        setIsActive(false);
                        setIsComplete(true);
                        return 0;
                    }

                    // Record WPM every second for consistency calculation
                    if (startTimeRef.current) {
                        // NOTE: strictly speaking this include pause time in WPM calc
                        const elapsed = (Date.now() - startTimeRef.current) / 1000;
                        const currentWpm = calculateWPM(correctChars, elapsed);
                        setWpmHistory((prev) => [...prev, currentWpm]);
                    }

                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, isPaused, timeRemaining, correctChars]);

    // Complete callback
    useEffect(() => {
        if (isComplete && onComplete && startTimeRef.current) {
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            onComplete({
                wpm: calculateWPM(correctChars, elapsed),
                accuracy: calculateAccuracy(correctChars, totalChars),
                consistency: calculateConsistency(wpmHistory),
                duration: duration - timeRemaining,
                problemKeys,
            });
        }
    }, [isComplete, onComplete, correctChars, totalChars, wpmHistory, problemKeys, duration, timeRemaining]);

    const handleInput = useCallback(
        (char: string) => {
            // Start timer on first input
            if (!isActive && !isComplete) {
                setIsActive(true);
                startTimeRef.current = Date.now();
                lastKeyTimeRef.current = Date.now();
            }

            if (!isActive && !startTimeRef.current) return;
            if (isComplete || isPaused) return;

            const currentWord = words[currentWordIndex];
            const expectedChar = currentWord?.[currentCharIndex];

            // Track key timing
            const now = Date.now();
            const keyTime = now - lastKeyTimeRef.current;
            lastKeyTimeRef.current = now;

            setTotalChars((prev) => prev + 1);

            if (char === expectedChar) {
                setCorrectChars((prev) => prev + 1);
                setInput((prev) => prev + char);
                setCurrentCharIndex((prev) => prev + 1);

                // Move to next word if current word is complete
                if (currentCharIndex + 1 >= currentWord.length) {
                    // Check if there's a space after this word
                    // We'll handle space separately
                }
            } else {
                // Track error
                setErrors((prev) => new Set(prev).add(`${currentWordIndex}-${currentCharIndex}`));
                setInput((prev) => prev + char);
                setCurrentCharIndex((prev) => prev + 1);

                // Track problem key (only if expectedChar exists)
                if (expectedChar) {
                    setProblemKeys((prev) => {
                        const existing = prev[expectedChar] || { errors: 0, avgTime: 0 };
                        return {
                            ...prev,
                            [expectedChar]: {
                                errors: existing.errors + 1,
                                avgTime: (existing.avgTime + keyTime) / 2,
                            },
                        };
                    });
                }
            }
        },
        [isActive, isComplete, words, currentWordIndex, currentCharIndex]
    );

    const handleSpace = useCallback(() => {
        // Start timer on first input
        if (!isActive && !isComplete) {
            setIsActive(true);
            startTimeRef.current = Date.now();
            lastKeyTimeRef.current = Date.now();
        }

        if (!isActive && !startTimeRef.current) return;
        if (isComplete || isPaused) return;

        const currentWord = words[currentWordIndex];

        // If word is complete, space moves to next word (correct)
        if (currentCharIndex >= currentWord.length) {
            setTotalChars((prev) => prev + 1);
            setCorrectChars((prev) => prev + 1);
            setCurrentWordIndex((prev) => {
                const nextIndex = prev + 1;
                // Generate more words if approaching the end
                if (nextIndex >= words.length - 10) {
                    setWords((currentWords) => [...currentWords, ...generateWords(50)]);
                }
                return nextIndex;
            });
            setCurrentCharIndex(0);
            setInput("");
        } else {
            // Space pressed before word is complete - treat as wrong character
            // Mark current position as error and move to next character in SAME word
            setErrors((prev) => new Set(prev).add(`${currentWordIndex}-${currentCharIndex}`));
            setTotalChars((prev) => prev + 1);
            setInput((prev) => prev + " ");
            setCurrentCharIndex((prev) => prev + 1);
        }
    }, [isActive, isComplete, words, currentWordIndex, currentCharIndex]);

    const handleBackspace = useCallback(() => {
        if (!isActive || isComplete) return;
        if (currentCharIndex === 0) return;

        // Calculate the key for the character being removed
        const indexToRemove = currentCharIndex - 1;
        const errorKey = `${currentWordIndex}-${indexToRemove}`;

        // Remove error if it exists for this character
        setErrors((prev) => {
            const newErrors = new Set(prev);
            newErrors.delete(errorKey);
            return newErrors;
        });

        setCurrentCharIndex((prev) => prev - 1);
        setInput((prev) => prev.slice(0, -1));
        setTotalChars((prev) => Math.max(0, prev - 1));
    }, [isActive, isComplete, currentCharIndex, currentWordIndex]);

    const reset = useCallback(() => {
        setWords(generateWords(100, { includePunctuation, includeNumbers }));
        setCurrentWordIndex(0);
        setCurrentCharIndex(0);
        setInput("");
        setIsActive(false);
        setIsPaused(false);
        setIsComplete(false);
        setTimeRemaining(duration);
        setCorrectChars(0);
        setTotalChars(0);
        setErrors(new Set());
        setWpmHistory([]);
        setProblemKeys({});
        startTimeRef.current = null;
        lastKeyTimeRef.current = 0;
    }, [duration, includePunctuation, includeNumbers]);

    const currentWpm = startTimeRef.current
        ? calculateWPM(correctChars, (Date.now() - startTimeRef.current) / 1000)
        : 0;

    const currentAccuracy = calculateAccuracy(correctChars, totalChars);

    return {
        words,
        currentWordIndex,
        currentCharIndex,
        input,
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
        start: () => {
            setIsActive(true);
            if (!startTimeRef.current) {
                startTimeRef.current = Date.now();
            }
        }
    };
}
