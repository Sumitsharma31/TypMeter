import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Create admin client for database operations to bypass RLS
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

        const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
            ? createClient(supabaseUrl, supabaseServiceKey)
            : supabase; // Fallback to anon client if no service key (might fail if RLS is on)

        const body = await req.json();
        const { wpm, accuracy, consistency, duration, problemKeys } = body;

        // Ensure user profile exists
        // Use admin client to ensure we can find/create profiles regardless of RLS
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("clerk_id", userId)
            .single();

        let profileId = profile?.id;

        // Create profile if not exists
        if (!profileId) {
            // Generate a username from Clerk data or random
            let username = user.username || user.firstName || `User-${userId.slice(0, 6)}`;
            // If username is just firstname, maybe append some random digits to ensure uniqueness if needed, 
            // but for now let's keep it simple. If we get a unique constraint error we might need to handle it,
            // but our schema doesn't enforce unique usernames yet (only unique clerk_id).

            const { data: newProfile, error: profileError } = await supabaseAdmin
                .from("profiles")
                .insert({
                    clerk_id: userId,
                    username: username,
                    avatar_url: user.imageUrl
                })
                .select("id")
                .single();

            if (profileError) {
                console.error("Profile creation error:", profileError);
                return NextResponse.json(
                    { error: "Failed to create profile" },
                    { status: 500 }
                );
            }
            profileId = newProfile?.id;
        }

        // Save test result
        const { data, error } = await supabaseAdmin
            .from("test_results")
            .insert({
                user_id: profileId,
                wpm,
                accuracy,
                consistency,
                duration,
                problem_keys: problemKeys,
            })
            .select()
            .single();

        if (error) {
            console.error("Save result error:", error);
            return NextResponse.json(
                { error: "Failed to save result: " + error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("clerk_id", userId)
            .single();

        if (!profile) {
            return NextResponse.json({ results: [] });
        }

        const { data, error } = await supabase
            .from("test_results")
            .select("*")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(10);

        if (error) {
            console.error("Fetch results error:", error);
            return NextResponse.json(
                { error: "Failed to fetch results" },
                { status: 500 }
            );
        }

        return NextResponse.json({ results: data });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
