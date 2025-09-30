import { openai } from './openai';
import { QUESTION_GENERATOR_PROMPT } from './prompts';
import { Question } from '../types';

interface GeneratedQuestion {
  text: string;
  rationale: string;
}

export async function generateQuestions(
  audience: string,
  hypothesis: string
): Promise<Question[]> {
  try {
    const prompt = QUESTION_GENERATOR_PROMPT
      .replace('{audience}', audience)
      .replace('{hypothesis}', hypothesis);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating Mom Test questions. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the response - it should be { "questions": [...] } or just [...]
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Handle both formats: { "questions": [...] } or just [...]
    const questions: GeneratedQuestion[] = Array.isArray(parsed) 
      ? parsed 
      : parsed.questions || [];

    // Convert to Question format (we'll score them in the next step)
    return questions.map((q) => ({
      text: q.text,
      momTestScore: 0, // Will be filled by critique
      issues: [], // Will be filled by critique
    }));

  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error('Failed to generate questions');
  }
}
