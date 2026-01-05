import { createClient } from '@supabase/supabase-js';

let supabaseClient: any = null;
let supabaseAdminClient: any = null;

export function getSupabase() {
    if (!supabaseClient) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Missing Supabase environment variables.');
        }

        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }
    return supabaseClient;
}

export function getSupabaseAdmin() {
    if (!supabaseAdminClient) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

        if (!supabaseUrl || !supabaseSecretKey) {
            throw new Error('Missing Supabase Admin environment variables.');
        }

        supabaseAdminClient = createClient(supabaseUrl, supabaseSecretKey);
    }
    return supabaseAdminClient;
}

// Database types
export interface Student {
    id: string;
    email: string;
    name: string;
    elo: number;
    school?: string;
    grade?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface Report {
    id: string;
    student_id: string;
    title: string;
    description: string;
    category: 'accomplishment' | 'todo' | 'award' | 'impact';
    file_urls?: string[];
    elo_awarded: number;
    ai_feedback?: string;
    status: 'pending' | 'graded' | 'rejected';
    created_at: string;
    graded_at?: string;
}

export interface LeaderboardEntry extends Student {
    rank: number;
    highlight?: string;
}
