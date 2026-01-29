import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create a mock client if credentials are not configured
const isConfigured = supabaseUrl.startsWith("http") && supabaseAnonKey.length > 0;

export const supabase: SupabaseClient = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient("https://placeholder.supabase.co", "placeholder-key");

export const isSupabaseConfigured = isConfigured;

// Database types
export interface Profile {
    id: string;
    clerk_id: string;
    username: string | null;
    avatar_url: string | null;
    created_at: string;
}

export interface TestResult {
    id: string;
    user_id: string | null;
    wpm: number;
    accuracy: number;
    consistency: number | null;
    duration: number;
    problem_keys: Record<string, { errors: number; avgTime: number }> | null;
    created_at: string;
}

export interface LeaderboardEntry {
    id: string;
    username: string;
    avatar_url: string | null;
    wpm: number;
    accuracy: number;
    duration: number;
    created_at: string;
}
