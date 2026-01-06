import { NextRequest, NextResponse } from 'next/server';
import { evaluateReport, generateEmailResponse } from '@/lib/openai';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendGmail } from '@/lib/gmail';

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
        // The prompt for evaluateReport is defined internally in '@/lib/openai'
        // and is expected to produce a JSON object like this:
        /*
        {
            "elo_awarded": <number 0-100>,
            "feedback": "<concise summary of results>",
            "analysis_parts": [
                "<Specific insight about the achievement (DO NOT prefix with 'Part 1' or 'Insight')>",
                "<Breakdown of the impact and complexity (DO NOT prefix with 'Part 2' or 'Breakdown')>",
                "<Professional encouragement and path forward (DO NOT prefix with 'Part 3', 'Compliment', or 'Encouragement')>"
            ],
            "category_score": {
                "impact": <number 0-10>,
                "productivity": <number 0-10>,
                "quality": <number 0-10>,
                "relevance": <number 0-10>
            }
        } (Ensure no em dashes, no italics, and NO LABEL PREFIXES like 'Part 1:', 'Compliment:', etc. in the text fields)
        */
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
                analysis_parts: evaluation.analysis_parts,
                category_score: evaluation.category_score,
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

        // Send real email using Gmail API
        try {
            if (student.email) {
                const subject = `Ultra has evaluated your submission!`;
                const html = generateEmailResponse(student.name, title, evaluation);

                console.log('Dispatching Gmail via App Password...', { to: student.email });
                const gmailResult = await sendGmail({
                    to: student.email,
                    subject,
                    html
                });

                if (!gmailResult.success) {
                    console.error('Gmail API Error:', gmailResult.error);
                } else {
                    console.log('Gmail sent successfully:', gmailResult.messageId);
                }
            }
        } catch (emailError) {
            console.error('Gmail automation failed:', emailError);
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
