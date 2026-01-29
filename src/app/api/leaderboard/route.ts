import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        // Get top scores from last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data, error } = await supabase
            .from("test_results")
            .select(`
        id,
        wpm,
        accuracy,
        created_at,
        profiles!inner(username, avatar_url)
      `)
            .gte("created_at", oneDayAgo)
            .order("wpm", { ascending: false })
            .limit(10);

        if (error) {
            console.error("Leaderboard fetch error:", error);
            // Return mock data if Supabase not configured
            return NextResponse.json({
                leaderboard: [
                    { id: "1", username: "SpeedDemon", wpm: 142, accuracy: 100 },
                    { id: "2", username: "KeyMaster99", wpm: 138, accuracy: 98 },
                    { id: "3", username: "TypoKing", wpm: 135, accuracy: 96 },
                ],
            });
        }

        const leaderboard = data?.map((entry) => ({
            id: entry.id,
            // @ts-expect-error - Supabase join typing
            username: entry.profiles?.username || "Anonymous",
            // @ts-expect-error - Supabase join typing
            avatar_url: entry.profiles?.avatar_url,
            wpm: entry.wpm,
            accuracy: entry.accuracy,
            created_at: entry.created_at,
        })) || [];

        return NextResponse.json({ leaderboard });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
