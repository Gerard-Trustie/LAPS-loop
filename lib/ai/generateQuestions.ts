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
      console.error('No content in OpenAI response');
      throw new Error('No response from OpenAI');
    }

    // Log token usage for cost tracking
    console.log('[Question Generation] Tokens used:', {
      prompt: response.usage?.prompt_tokens,
      completion: response.usage?.completion_tokens,
      total: response.usage?.total_tokens,
    });

    // Parse the response - should be { "questions": [...] }
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Extract questions array
    const questions: GeneratedQuestion[] = parsed.questions || [];

    if (!Array.isArray(questions) || questions.length === 0) {
      console.error('No questions in parsed response:', parsed);
      throw new Error('OpenAI returned no questions. Response structure: ' + JSON.stringify(parsed));
    }

    console.log(`[Question Generation] Generated ${questions.length} questions`);

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
