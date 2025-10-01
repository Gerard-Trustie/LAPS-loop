'use server';

import { openai } from '@/lib/ai/openai';

export async function generateFakeAnswers(
  questions: string[],
  context: { audience: string; hypothesis: string }
): Promise<string[]> {
  try {
    const prompt = `You are roleplaying as someone from this target audience: "${context.audience}"

The survey is testing this hypothesis: "${context.hypothesis}"

Generate realistic, detailed survey responses for the following questions. Each answer should:
- Be 80-150 characters long
- Sound authentic and personal (use "I" statements)
- Be specific and detailed (not generic)
- Relate to the target audience's real experiences

Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Return ONLY a JSON object with this structure:
{
  "answers": ["answer 1", "answer 2", ...]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates realistic survey responses. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8, // Higher temp for variety
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    console.log('[Fake Answers] Tokens used:', {
      prompt: response.usage?.prompt_tokens,
      completion: response.usage?.completion_tokens,
      total: response.usage?.total_tokens,
    });

    const parsed = JSON.parse(content);
    const answers = parsed.answers || [];

    if (!Array.isArray(answers) || answers.length !== questions.length) {
      console.error('Invalid fake answers response:', parsed);
      throw new Error('OpenAI returned wrong number of answers');
    }

    console.log(`[Fake Answers] Generated ${answers.length} fake answers`);
    return answers;

  } catch (error) {
    console.error('Error generating fake answers:', error);
    throw new Error('Failed to generate fake answers');
  }
}
