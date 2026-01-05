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
  analysis_parts: string[];
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
  "feedback": "<concise summary of results>",
  "analysis_parts": [
    "<Part 1: Specific insight about the achievement>",
    "<Part 2: Breakdown of the impact and complexity>",
    "<Part 3: Professional compliment and path forward>"
  ],
  "category_score": {
    "impact": <number 0-10>,
    "productivity": <number 0-10>,
    "quality": <number 0-10>,
    "relevance": <number 0-10>
  }
} (Ensure no em dashes and no italics in the text fields) `;

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
      feedback: 'Evaluation failed.',
      analysis_parts: ['Evaluation failed. Please provide more significant details.'],
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
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000000; color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #0a0a0a; border: 1px solid #333; border-radius: 24px; overflow: hidden; }
    .header { padding: 40px; text-align: center; border-bottom: 1px solid #333; }
    .logo { font-size: 24px; font-weight: bold; letter-spacing: -1px; }
    .badge { display: inline-block; background-color: #ffffff; color: #000000; padding: 4px 12px; border-radius: 100px; font-size: 10px; text-transform: uppercase; vertical-align: middle; margin-left: 8px; font-weight: 800; }
    .content { padding: 40px; }
    .elo-display { font-size: 72px; font-weight: 900; letter-spacing: -4px; margin: 20px 0; text-align: center; }
    .title { font-size: 20px; font-weight: bold; text-align: center; color: #888; margin-bottom: 40px; }
    .section-label { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #555; margin-bottom: 12px; }
    .feedback-box { background-color: #111; border-radius: 16px; padding: 24px; font-size: 16px; line-height: 1.6; color: #ccc; margin-bottom: 32px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 40px; }
    .grid-item { background-color: #111; border-radius: 16px; padding: 16px; }
    .grid-label { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #444; margin-bottom: 4px; }
    .grid-value { font-size: 18px; font-weight: bold; }
    .footer { padding: 40px; text-align: center; font-size: 12px; color: #444; border-top: 1px solid #333; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Ultra<span class="badge">eval</span></div>
    </div>
    <div class="content">
      <div class="section-label" style="text-align: center;">Accomplishment Verified</div>
      <div class="elo-display">+${evaluation.elo_awarded}</div>
      <div class="title">${reportTitle}</div>
      
      <div class="section-label">Evaluation Notes</div>
      <div class="feedback-box">"${evaluation.feedback}"</div>
      
      <div class="section-label">Performance Metrics</div>
      <div class="grid" style="display: table; width: 100%;">
        <div style="display: table-row;">
          <div style="display: table-cell; padding: 8px;">
            <div class="grid-item">
              <div class="grid-label">Impact</div>
              <div class="grid-value">${evaluation.category_score.impact}/10</div>
            </div>
          </div>
          <div style="display: table-cell; padding: 8px;">
            <div class="grid-item">
              <div class="grid-label">Quality</div>
              <div class="grid-value">${evaluation.category_score.quality}/10</div>
            </div>
          </div>
        </div>
        <div style="display: table-row;">
          <div style="display: table-cell; padding: 8px;">
            <div class="grid-item">
              <div class="grid-label">Productivity</div>
              <div class="grid-value">${evaluation.category_score.productivity}/10</div>
            </div>
          </div>
          <div style="display: table-cell; padding: 8px;">
            <div class="grid-item">
              <div class="grid-label">Relevance</div>
              <div class="grid-value">${evaluation.category_score.relevance}/10</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      This is a verified evaluation protocol. Issued to ${studentName}.
    </div>
  </div>
</body>
</html>
  `.trim();
}
