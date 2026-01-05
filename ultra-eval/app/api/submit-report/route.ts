import { NextRequest, NextResponse } from 'next/server';
import { evaluateReport, generateEmailResponse } from '@/lib/openai';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, category, studentId, fileUrls } = body;

        // Validate required fields
        if (!title || !description || !category || !studentId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();

        // Get student info
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('id', studentId)
            .single();

        if (studentError || !student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        // Evaluate the report using OpenAI
        const evaluation = await evaluateReport(
            title,
            description,
            category,
            fileUrls
        );

        // Create the report in database
        const { data: report, error: reportError } = await supabase
            .from('reports')
            .insert({
                student_id: studentId,
                title,
                description,
                category,
                file_urls: fileUrls || [],
                elo_awarded: evaluation.elo_awarded,
                ai_feedback: evaluation.feedback,
                status: 'graded',
                graded_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (reportError) {
            console.error('Error creating report:', reportError);
            return NextResponse.json(
                { error: 'Failed to create report' },
                { status: 500 }
            );
        }

        // Update student's ELO
        const newElo = student.elo + evaluation.elo_awarded;
        const { error: updateError } = await supabase
            .from('students')
            .update({
                elo: newElo,
                updated_at: new Date().toISOString(),
            })
            .eq('id', studentId);

        if (updateError) {
            console.error('Error updating student ELO:', updateError);
        }

        // Generate email content (would be sent via email service in production)
        const emailContent = generateEmailResponse(
            student.name,
            title,
            evaluation
        );

        // In production, you would send this email here
        // For now, we'll log it
        console.log('Email would be sent:', emailContent);

        return NextResponse.json({
            success: true,
            report,
            evaluation,
            newElo,
        });
    } catch (error) {
        console.error('Error in submit-report API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
