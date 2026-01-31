"use client";

import { useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TypingTest from "@/components/TypingTest";
import ResultsGrid from "@/components/ResultsGrid";
import Leaderboard from "@/components/Leaderboard";
import PreviousScores, { ScoreRecord, saveGuestScore } from "@/components/PreviousScores";
import { TestResult } from "@/hooks/useTypingTest";

import { useTheme } from "@/hooks/useTheme";

export default function Home() {
  const { theme } = useTheme();
  const { userId } = useAuth();
  const { user } = useUser();
  const [duration, setDuration] = useState(30);
  const [result, setResult] = useState<TestResult | null>(null);
  const [latestScore, setLatestScore] = useState<ScoreRecord | undefined>();
  const [scoreKey, setScoreKey] = useState(0); // Force refresh of PreviousScores (legacy but maybe used for API triggers)
  const [testKey, setTestKey] = useState(0); // Key to force re-mount of TypingTest

  const handleTestComplete = useCallback(async (testResult: TestResult) => {
    setResult(testResult);

    // Construct score object for UI update
    const scoreRecord: ScoreRecord = {
      id: Date.now().toString(), // Temporary ID until refresh
      // ... existing code ...
      wpm: testResult.wpm,
      accuracy: testResult.accuracy,
      consistency: testResult.consistency,
      duration: testResult.duration,
      mode: testResult.duration > 0 ? "time" : "words",
      created_at: new Date().toISOString(),
    };

    // Save to database if user is authenticated
    if (userId && user) {
      try {
        const response = await fetch('/api/scores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            result: {
              wpm: testResult.wpm,
              accuracy: testResult.accuracy,
              consistency: testResult.consistency,
              duration: testResult.duration,
              problemKeys: testResult.problemKeys,
            },
            username: user.username || user.firstName || `User-${userId.slice(0, 6)}`,
            avatar_url: user.imageUrl,
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to save result:", errorData.error);
        }

        // Trigger refresh of PreviousScores and Leaderboard via key/trigger
        setScoreKey((prev) => prev + 1);
        // Also update latestScore to trigger immediate feedback if previous scores listens to it
        setLatestScore(scoreRecord);
      } catch (error) {
        console.error("Failed to save result:", error);
      }
    } else {
      // Save to localStorage for guests
      const savedScore = saveGuestScore({
        wpm: testResult.wpm,
        accuracy: testResult.accuracy,
        consistency: testResult.consistency,
        duration: testResult.duration,
        mode: "time",
      });
      setLatestScore(savedScore);
      setScoreKey((prev) => prev + 1);
    }
  }, [userId]);

  const handleRestart = () => {
    setResult(null);
    setTestKey(prev => prev + 1);
    // Optionally focus the game? TypingTest does that on mount.
  };

  return (
    <>
      <Header />

      <main className="flex-grow pt-32 pb-12 px-6 flex flex-col gap-12 container mx-auto max-w-5xl">
        {/* Typing Test Section */}
        <TypingTest
          key={testKey}
          duration={duration}
          onComplete={handleTestComplete}
          onDurationChange={setDuration}
        />

        {/* Divider */}
        {/* Divider */}
        <div
          className="w-full h-px"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)'
              : 'linear-gradient(to right, transparent, rgba(203,213,225,1), transparent)'
          }}
        ></div>

        {/* Results Section */}
        <ResultsGrid result={result} onRestart={handleRestart} />

        {/* Divider */}
        {/* Divider */}
        <div
          className="w-full h-px"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)'
              : 'linear-gradient(to right, transparent, rgba(203,213,225,1), transparent)'
          }}
        ></div>

        {/* Previous Scores History */}
        <PreviousScores onNewScore={latestScore} />

        {/* Divider */}
        {/* Divider */}
        <div
          className="w-full h-px"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)'
              : 'linear-gradient(to right, transparent, rgba(203,213,225,1), transparent)'
          }}
        ></div>

        {/* Leaderboard */}
        <Leaderboard refreshTrigger={scoreKey} />
      </main>

      <Footer />
    </>
  );
}
