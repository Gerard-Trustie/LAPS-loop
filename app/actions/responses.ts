'use server';

import { prisma } from '@/lib/db/prisma';
import { Response } from '@prisma/client';

export async function submitResponse(data: {
  surveyId: string;
  answers: Array<{ question: string; answer: string }>;
  prolificPid?: string;
}): Promise<Response> {
  const response = await prisma.response.create({
    data: {
      surveyId: data.surveyId,
      answers: data.answers,
      prolificPid: data.prolificPid,
    },
  });

  return response;
}

export async function getResponses(surveyId: string): Promise<Response[]> {
  return prisma.response.findMany({
    where: { surveyId },
    orderBy: { completedAt: 'desc' },
  });
}

export async function getResponseCount(surveyId: string): Promise<number> {
  return prisma.response.count({
    where: { surveyId },
  });
}

export async function exportResponsesCSV(surveyId: string): Promise<string> {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: { responses: true },
  });

  if (!survey) {
    throw new Error('Survey not found');
  }

  const questions = survey.questions as Array<{ text: string }>;

  // Build CSV header
  const headers = [
    'Response ID',
    'Completed At',
    'Prolific PID',
    ...questions.map((q, i) => `Q${i + 1}: ${q.text}`),
  ];

  // Build CSV rows
  const rows = survey.responses.map((response) => {
    const answers = response.answers as Array<{ question: string; answer: string }>;
    return [
      response.id,
      response.completedAt.toISOString(),
      response.prolificPid || '',
      ...answers.map((a) => `"${a.answer.replace(/"/g, '""')}"`), // Escape quotes
    ];
  });

  // Combine into CSV
  const csv = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csv;
}