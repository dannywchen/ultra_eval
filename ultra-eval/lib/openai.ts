import OpenAI from 'openai';

let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (!openai) {
    const apiKey = process.env.OPENAI_API;
    if (!apiKey) {
      throw new Error('Missing OPENAI_API environment variable.');
    }
    openai = new OpenAI({
      apiKey,
    });
  }
  return openai;
}

export interface EvaluationResult {
  elo_awarded: number;
  feedback: string;
  category_score: {
    impact: number;
    productivity: number;
    quality: number;
    relevance: number;
  };
}

/**
 * Evaluates a student report using OpenAI's GPT-5 mini API
 * @param title - Report title
 * @param description - Report description
 * @param category - Report category (accomplishment, todo, award, impact)
 * @param fileUrls - Optional file URLs attached to the report
 * @returns EvaluationResult with elo points and detailed feedback
 */
export async function evaluateReport(
  title: string,
  description: string,
  category: string,
  fileUrls?: string[]
): Promise<EvaluationResult> {
  const prompt = `You are an evaluator for Ultra Eval, a system that grades student accomplishments and awards them ELO points.

Evaluate the following student report:

**Title:** ${title}
**Category:** ${category}
**Description:** ${description}
${fileUrls && fileUrls.length > 0 ? `**Attached Files:** ${fileUrls.length} file(s)` : ''}

Rate the report on the following criteria (1-10 scale):
1. **Impact**: How significant is this accomplishment?
2. **Productivity**: How much effort/work does this demonstrate?
3. **Quality**: How well is this presented and documented?
4. **Relevance**: How relevant is this to academic/professional growth?

Based on these criteria, calculate an ELO award (can be any number ranging from 0 to 100, does not have to end with 0 or 5)
- Low Impact (1-3): 0-30 ELO
- Medium Impact (4-6): 31-60 ELO
- High Impact (7-9): 61-90 ELO
- Exceptional Impact (10): 91-100 ELO

Provide your response in the following JSON format:
{
  "elo_awarded": <number 0-100>,
  "feedback": "<constructive feedback string>",
  "category_score": {
    "impact": <number 1-10>,
    "productivity": <number 1-10>,
    "quality": <number 1-10>,
    "relevance": <number 1-10>
  }
}`;

  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-5-mini-2025-08-07',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert evaluator for high-achieving students. Provide meticulous, professional feedback and assign ELO scores between 0 and 100 based on impact.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(responseContent) as EvaluationResult;

    // Ensure ELO is within the 0-100 bounds requested
    result.elo_awarded = Math.max(0, Math.min(100, result.elo_awarded));

    return result;
  } catch (error) {
    console.error('OpenAI evaluation error:', error);
    // Return a default evaluation in case of error
    return {
      elo_awarded: 5,
      feedback:
        'Your report has been received. Please try to provide more details for a more accurate evaluation.',
      category_score: {
        impact: 2,
        productivity: 2,
        quality: 2,
        relevance: 2,
      },
    };
  }
}

/**
 * Generates an email response for the student with their evaluation
 * @param studentName - Name of the student
 * @param reportTitle - Title of the report
 * @param evaluation - Evaluation result
 * @returns Formatted email content
 */
export function generateEmailResponse(
  studentName: string,
  reportTitle: string,
  evaluation: EvaluationResult
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; background: #ffffff; }
    .elo-badge { background: #4CAF50; color: white; padding: 10px 20px; border-radius: 20px; font-size: 24px; font-weight: bold; display: inline-block; margin: 20px 0; }
    .scores { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .score-item { background: #f5f5f5; padding: 15px; border-radius: 8px; }
    .feedback { background: #f9f9f9; border-left: 4px solid #4CAF50; padding: 20px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Ultra Eval</h1>
    <p>Your Report Has Been Evaluated</p>
  </div>
  <div class="content">
    <h2>Hi ${studentName},</h2>
    <p>Your report "<strong>${reportTitle}</strong>" has been evaluated by our AI system.</p>
    
    <div style="text-align: center;">
      <div class="elo-badge">+${evaluation.elo_awarded} ELO</div>
    </div>
    
    <h3>Score Breakdown</h3>
    <div class="scores">
      <div class="score-item">
        <strong>Impact:</strong> ${evaluation.category_score.impact}/10
      </div>
      <div class="score-item">
        <strong>Productivity:</strong> ${evaluation.category_score.productivity}/10
      </div>
      <div class="score-item">
        <strong>Quality:</strong> ${evaluation.category_score.quality}/10
      </div>
      <div class="score-item">
        <strong>Relevance:</strong> ${evaluation.category_score.relevance}/10
      </div>
    </div>
    
    <div class="feedback">
      <h3>Feedback</h3>
      <p>${evaluation.feedback}</p>
    </div>
    
    <p>Keep up the great work!</p>
    <p><strong>The Ultra Eval Team</strong></p>
  </div>
</body>
</html>
  `.trim();
}
