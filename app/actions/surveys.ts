'use server';

import { generateQuestions } from '@/lib/ai/generateQuestions';
import { critiqueQuestions } from '@/lib/ai/critiqueQuestions';

export async function generateSurveyQuestions(
  audience: string,
  hypothesis: string
) {
  // Generate questions
  const questions = await generateQuestions(audience, hypothesis);

  // Critique them
  const critiquedQuestions = await critiqueQuestions(questions);

  return critiquedQuestions;
}

export async function regenerateQuestion(
  questionText: string,
  audience: string,
  hypothesis: string
) {
  // Generate fresh questions and return a replacement
  const questions = await generateQuestions(audience, hypothesis);
  const critiquedQuestions = await critiqueQuestions(questions);

  // Return the first one as a replacement
  return critiquedQuestions[0];
}
