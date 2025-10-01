'use server';

import { prisma } from '@/lib/db/prisma';
import { Survey } from '@prisma/client';

export async function createSurvey(data: {
  title: string;
  audience: string;
  hypothesis: string;
  questions: Array<{ text: string; momTestScore: number; issues: string[] }>;
}): Promise<Survey> {
  // Generate unique completion code
  const completionCode = `LAPS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const survey = await prisma.survey.create({
    data: {
      title: data.title,
      audience: data.audience,
      hypothesis: data.hypothesis,
      questions: data.questions,
      completionCode,
    },
  });

  return survey;
}

export async function getSurveys(): Promise<Survey[]> {
  return prisma.survey.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getSurveyById(id: string) {
  return prisma.survey.findUnique({
    where: { id },
    include: {
      responses: true,
      analysis: true,
    },
  });
}
