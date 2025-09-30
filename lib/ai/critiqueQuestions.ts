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
      throw new Error('No response from OpenAI');
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Handle both formats: { "critiques": [...] } or just [...]
    const critiques: CritiqueResult[] = Array.isArray(parsed) 
      ? parsed 
      : parsed.critiques || parsed.questions || [];

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
