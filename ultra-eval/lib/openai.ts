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
  const prompt = `You are a high-level achievement evaluator for Ultra Eval. Your task is to analyze a student's reported accomplishment and assign an ELO score (0-100) based on its objective real-world impact.

STUDENT REPORT:
**Title:** ${title}
**Category:** ${category}
**Description:** ${description}
${fileUrls && fileUrls.length > 0 ? `**Attached Files:** ${fileUrls.length} file(s)` : ''}

CRITICAL CONSTRAINTS:
1. **NO EM DASHES**: Do not use the em dash character (-). Use regular hyphens (-) or colons instead.
2. **COMPLIMENT**: You MUST include a professional compliment about the user's progress or the specific achievement.
3. **DETAIL**: Explain exactly why the ELO was awarded by referencing the scores in Impact, Productivity, Quality, and Relevance. Break it down so the user understands the value of their work.
4. **FORMATTING**: Use clear, concise sentences. Avoid flowery language.

GRADING CRITERIA:
1. **Nonsense/Filler Check**: If the report is nonsensical, gibberish, or lacks substance, you MUST award **0 ELO**.
2. **Impact (0-10)**: Real-world effect or problem-solving scale.
3. **Productivity (0-10)**: Discipline and effort demonstrated.
4. **Quality (0-10)**: Complexity and execution.
5. **Relevance (0-10)**: Academic or professional growth alignment.

ELO CALCULATION (0-100):
- 0: Nonsense or invalid input.
- 1-30: Minor tasks or daily habits.
- 31-60: Significant projects or local recognition.
- 61-90: High-scale impact or national recognition.
- 91-100: Exceptional, world-class excellence.

Provide your response in the following JSON format:
{
  "elo_awarded": <number 0-100>,
  "feedback": "<detailed analysis with compliment, ensuring no em dashes>",
  "category_score": {
    "impact": <number 0-10>,
    "productivity": <number 0-10>,
    "quality": <number 0-10>,
    "relevance": <number 0-10>
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
            'You are a strict, fair achievement evaluator. If a report is garbage or nonsense, reward 0 ELO. Otherwise, award 0-100 based on impact.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(responseContent) as EvaluationResult;
    result.elo_awarded = Math.max(0, Math.min(100, result.elo_awarded));

    return result;
  } catch (error) {
    console.error('OpenAI evaluation error:', error);
    return {
      elo_awarded: 0,
      feedback: 'Evaluation failed. Please provide more significant details.',
      category_score: { impact: 0, productivity: 0, quality: 0, relevance: 0 },
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
