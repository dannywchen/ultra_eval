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
 * Evaluates a student report using OpenAI's GPT-4o mini API with Vision support
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
  
  If there are images attached, ANALYZE THEM carefully as primary evidence.

STUDENT REPORT:
**Title:** ${title}
**Category:** ${category}
**Description:** ${description}

CRITICAL CONSTRAINTS:
1. **NO EM DASHES**: Do not use the em dash character (-). Use regular hyphens (-) or colons instead.
2. **DETAIL**: Explain exactly why the ELO was awarded by referencing the scores in Impact, Productivity, Quality, and Relevance. Break it down so the user understands the value of their work.
3. **FORMATTING**: Use clear, concise sentences. NO LABEL PREFIXES like 'Part 1:', 'Insight:', etc. in the list of analysis_parts.

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
    "<Specific insight about the achievement (NO LABELS)>",
    "<Breakdown of the impact and complexity (NO LABELS)>",
    "<Professional encouragement and path forward (NO LABELS)>"
  ],
  "category_score": {
    "impact": <number 0-10>,
    "productivity": <number 0-10>,
    "quality": <number 0-10>,
    "relevance": <number 0-10>
  }
} (Ensure no em dashes, no italics, and NO LABEL PREFIXES in the text fields) `;

  try {
    const client = getOpenAIClient();

    // Prepare content with vision if images are available
    const content: any[] = [{ type: 'text', text: prompt }];

    if (fileUrls && fileUrls.length > 0) {
      fileUrls.forEach(url => {
        // Only add if it looks like an image, simplified check
        if (url.match(/\.(jpg|jpeg|png|webp|gif)$|supabase\.co/i)) {
          content.push({
            type: 'image_url',
            image_url: { url }
          });
        }
      });
    }

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini', // Vision capable
      messages: [
        {
          role: 'system',
          content: 'You are a strict, fair achievement evaluator. If a report is garbage or nonsense, reward 0 ELO. Otherwise, award 0-100 based on impact.',
        },
        {
          role: 'user',
          content: content,
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
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; color: #000000; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; padding: 40px; }
    .header { margin-bottom: 40px; }
    .logo { height: 30px; width: auto; }
    .content { space-y: 24px; }
    .greeting { font-size: 16px; font-weight: 500; margin-bottom: 24px; }
    .elo-card { background-color: #f4f4f5; border-radius: 16px; padding: 32px; margin-bottom: 32px; }
    .elo-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; margin-bottom: 8px; }
    .elo-value { font-size: 48px; font-weight: 800; letter-spacing: -0.02em; color: #000000; }
    .report-title { font-size: 18px; font-weight: 600; color: #18181b; margin-top: 4px; }
    .feedback { font-size: 15px; line-height: 1.6; color: #3f3f46; margin-bottom: 32px; border-left: 2px solid #e4e4e7; padding-left: 20px; }
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px; }
    .metric-item { background-color: #fafafa; border: 1px solid #f4f4f5; border-radius: 12px; padding: 16px; }
    .metric-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #a1a1aa; margin-bottom: 4px; }
    .metric-value { font-size: 16px; font-weight: 700; color: #18181b; }
    .footer { margin-top: 60px; padding-top: 24px; border-top: 1px solid #f4f4f5; font-size: 13px; color: #a1a1aa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://rhbgejhoigdbbdwiklih.supabase.co/storage/v1/object/public/assets/White%20Logo%20512x174.png" class="logo" alt="Ultra" style="filter: invert(1); max-height: 24px;">
    </div>
    
    <div class="content">
      <p class="greeting">Hi ${studentName.split(' ')[0]},</p>
      
      <div class="elo-card">
        <div class="elo-label">ELO Awarded</div>
        <div class="elo-value">+${evaluation.elo_awarded}</div>
        <div class="report-title">${reportTitle}</div>
      </div>

      <div class="elo-label">Analysis</div>
      <div class="feedback">
        ${evaluation.feedback}
      </div>

      <div class="elo-label">Metrics Breakdown</div>
      <div class="metrics-grid" style="display: table; width: 100%;">
        <div style="display: table-row;">
          <div style="display: table-cell; width: 50%; padding-right: 6px; padding-bottom: 12px;">
            <div class="metric-item">
              <div class="metric-label">Impact</div>
              <div class="metric-value">${evaluation.category_score.impact}/10</div>
            </div>
          </div>
          <div style="display: table-cell; width: 50%; padding-left: 6px; padding-bottom: 12px;">
            <div class="metric-item">
              <div class="metric-label">Quality</div>
              <div class="metric-value">${evaluation.category_score.quality}/10</div>
            </div>
          </div>
        </div>
        <div style="display: table-row;">
          <div style="display: table-cell; width: 50%; padding-right: 6px;">
            <div class="metric-item">
              <div class="metric-label">Productivity</div>
              <div class="metric-value">${evaluation.category_score.productivity}/10</div>
            </div>
          </div>
          <div style="display: table-cell; width: 50%; padding-left: 6px;">
            <div class="metric-item">
              <div class="metric-label">Relevance</div>
              <div class="metric-value">${evaluation.category_score.relevance}/10</div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        Ultra Eval
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

