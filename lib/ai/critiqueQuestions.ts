import { openai } from './openai';
import { QUESTION_CRITIC_PROMPT } from './prompts';
import { Question } from '../types';

interface CritiqueResult {
  text: string;
  score: number;
  issues: string[];
}

export async function critiqueQuestions(
  questions: Question[]
): Promise<Question[]> {
  try {
    const questionsText = questions.map((q, i) => `${i + 1}. ${q.text}`).join('\n');
    
    const prompt = QUESTION_CRITIC_PROMPT.replace('{questions}', questionsText);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at evaluating Mom Test questions. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temp for consistency
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('No content in OpenAI response');
      throw new Error('No response from OpenAI');
    }

    // Log token usage for cost tracking
    console.log('[Question Critique] Tokens used:', {
      prompt: response.usage?.prompt_tokens,
      completion: response.usage?.completion_tokens,
      total: response.usage?.total_tokens,
    });

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Extract critiques array - should be { "critiques": [...] }
    const critiques: CritiqueResult[] = parsed.critiques || [];

    if (!Array.isArray(critiques) || critiques.length === 0) {
      console.error('No critiques in parsed response:', parsed);
      throw new Error('OpenAI returned no critiques. Response structure: ' + JSON.stringify(parsed));
    }

    console.log(`[Question Critique] Critiqued ${critiques.length} questions`);

    // Merge critique results with original questions
    return questions.map((q, i) => ({
      text: q.text,
      momTestScore: critiques[i]?.score ?? 50,
      issues: critiques[i]?.issues ?? [],
    }));

  } catch (error) {
    console.error('Error critiquing questions:', error);
    throw new Error('Failed to critique questions');
  }
}
