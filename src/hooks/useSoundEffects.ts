"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type SoundType = "click" | "error" | "success" | "gameover" | "levelup";

interface SoundOptions {
    volume?: number; // 0.0 to 1.0
}

export function useSoundEffects() {
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize Audio Context on user interaction (to handle autoplay policies)
    useEffect(() => {
        const initAudio = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
        };

        window.addEventListener('click', initAudio, { once: true });
        window.addEventListener('keydown', initAudio, { once: true });

        // Load settings
        const savedMute = localStorage.getItem("typmeter_muted");
        if (savedMute) setIsMuted(savedMute === "true");

        return () => {
            window.removeEventListener('click', initAudio);
            window.removeEventListener('keydown', initAudio);
            audioContextRef.current?.close();
        };
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted((prev) => {
            const newState = !prev;
            localStorage.setItem("typmeter_muted", String(newState));
            return newState;
        });
    }, []);

    const playSound = useCallback((type: SoundType, options?: SoundOptions) => {
        if (isMuted) return;

        // In a real app with assets, we would load files here.
        // For this demo/task, we'll use synthesized tones for immediate feedback 
        // until the user adds actual assets. This ensures "it just works".
        // If assets exist, we'd try to play them.

        // Simple synth fallback to avoid needing external files immediately
        try {
            const ctx = audioContextRef.current;
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            const vol = options?.volume ?? volume;
            const now = ctx.currentTime;

            switch (type) {
                case "click":
                    // Sharp text click
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(800, now);
                    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                    gainNode.gain.setValueAtTime(vol * 0.3, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                    osc.start(now);
                    osc.stop(now + 0.05);
                    break;

                case "error":
                    // Low thud
                    osc.type = "sawtooth";
                    osc.frequency.setValueAtTime(150, now);
                    osc.frequency.linearRampToValueAtTime(100, now + 0.1);
                    gainNode.gain.setValueAtTime(vol * 0.5, now);
                    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.15);
                    osc.start(now);
                    osc.stop(now + 0.15);
                    break;

                case "success":
                    // High ping
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(1200, now);
                    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
                    gainNode.gain.setValueAtTime(vol * 0.4, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    osc.start(now);
                    osc.stop(now + 0.3);
                    break;

                case "gameover":
                    // Descending tone
                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.linearRampToValueAtTime(100, now + 0.5);
                    gainNode.gain.setValueAtTime(vol * 0.6, now);
                    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.5);
                    osc.start(now);
                    osc.stop(now + 0.5);
                    break;

                case "levelup":
                    // Ascending major triad
                    osc.type = "square";
                    osc.frequency.setValueAtTime(440, now);
                    osc.frequency.setValueAtTime(554, now + 0.1); // C#
                    osc.frequency.setValueAtTime(659, now + 0.2); // E
                    gainNode.gain.setValueAtTime(vol * 0.3, now);
                    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.4);
                    osc.start(now);
                    osc.stop(now + 0.4);
                    break;
            }
        } catch (e) {
            console.error("Audio error:", e);
        }
    }, [isMuted, volume]);

    return { playSound, isMuted, toggleMute, setVolume };
}
