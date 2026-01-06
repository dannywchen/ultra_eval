
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const supabase = getSupabase(); // This is the anon client

        // Verify the user using the token
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const adminEmails = ['dannywchen3@gmail.com'];
        if (!user.email || !adminEmails.includes(user.email)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Use admin client to reliably fetch data after verification
        const adminClient = getSupabaseAdmin();
        const { data, error } = await adminClient
            .from('students')
            .select('*')
            .order('elo', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
