
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export async function POST(req: NextRequest) {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
        console.error("SUPABASE_SERVICE_ROLE_KEY is not defined");
        return NextResponse.json({ error: 'Server configuration error: Missing Service Key' }, { status: 500 });
    }

    // Create a Supabase client with the SERVICE ROLE key to bypass RLS
    // Initializing per-request is safe and avoids build-time errors if env is missing
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    try {
        const body = await req.json();
        const { userId, result, username, avatar_url } = body;

        // Note: For production security, install @clerk/nextjs and use getAuth(req) 
        // to verify the user identity from valid session cookies/headers.
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Ensure Profile Exists
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        let profileId = profile?.id;

        if (!profileId) {
            // Create new profile
            const { data: newProfile, error: createError } = await supabaseAdmin
                .from('profiles')
                .insert({
                    clerk_id: userId,
                    username: username || 'User',
                    avatar_url: avatar_url
                })
                .select('id')
                .single();

            if (createError) {
                console.error("Error creating profile:", createError);
                return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
            }
            profileId = newProfile.id;
        }

        // 2. Insert Score
        const { data: score, error: scoreError } = await supabaseAdmin
            .from('test_results')
            .insert({
                user_id: profileId,
                wpm: result.wpm,
                accuracy: result.accuracy,
                consistency: result.consistency,
                duration: result.duration,
                problem_keys: result.problemKeys
            })
            .select()
            .single();

        if (scoreError) {
            console.error("Error inserting score:", scoreError);
            return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
        }

        return NextResponse.json({ success: true, score });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
