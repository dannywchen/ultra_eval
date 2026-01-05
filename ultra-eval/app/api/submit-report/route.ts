import { NextRequest, NextResponse } from 'next/server';
import { evaluateReport, generateEmailResponse } from '@/lib/openai';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

// Initialize Resend only if API key is present to avoid crashing
const getResendClient = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;
    return new Resend(apiKey);
};

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

        // Get student info including email
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

        // Send real email using Resend
        // Send email only if client is available
        try {
            const resendClient = getResendClient();
            if (resendClient && student.email) {
                await resendClient.emails.send({
                    from: 'Ultra Eval <notifications@ultraeval.com>',
                    to: student.email,
                    subject: `+${evaluation.elo_awarded} ELO: "${title}" Graded`,
                    html: generateEmailResponse(student.name, title, evaluation),
                });
            } else {
                console.warn('Resend client or student email missing. Email skipped.');
            }
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
        }

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
