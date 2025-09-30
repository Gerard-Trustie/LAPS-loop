import { z } from 'zod';

export const createSurveySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  audience: z.string().min(10, 'Audience description must be at least 10 characters'),
  hypothesis: z.string().min(10, 'Hypothesis must be at least 10 characters'),
  questions: z.array(
    z.object({
      text: z.string().min(5, 'Question must be at least 5 characters'),
      momTestScore: z.number().min(0).max(100),
      issues: z.array(z.string()),
    })
  ).min(1, 'At least one question is required'),
});

export const submitResponseSchema = z.object({
  surveyId: z.string().uuid('Invalid survey ID'),
  answers: z.array(
    z.object({
      question: z.string(),
      answer: z.string().min(50, 'Answer must be at least 50 characters'),
    })
  ).min(1, 'At least one answer is required'),
  prolificPid: z.string().optional(),
});

export const generateQuestionsSchema = z.object({
  audience: z.string().min(10, 'Audience description must be at least 10 characters'),
  hypothesis: z.string().min(10, 'Hypothesis must be at least 10 characters'),
});

export type CreateSurveyInput = z.infer<typeof createSurveySchema>;
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>;