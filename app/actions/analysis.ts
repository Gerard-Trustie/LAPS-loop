'use server';

import { prisma } from '@/lib/db/prisma';
import { analyzePainSignals } from '@/lib/ai/analyzePain';
import { Analysis } from '@prisma/client';

export async function analyzeSurvey(surveyId: string): Promise<Analysis> {
  // Get survey with responses
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: { responses: true },
  });

  if (!survey) {
    throw new Error('Survey not found');
  }

  if (survey.responses.length === 0) {
    throw new Error('Need at least 1 response to analyze');
  }

  // Check if analysis already exists and delete it to re-analyze
  const existingAnalysis = await prisma.analysis.findUnique({
    where: { surveyId },
  });

  if (existingAnalysis) {
    await prisma.analysis.delete({
      where: { surveyId },
    });
  }

  // Analyze pain signals
  const questions = survey.questions as Array<{ text: string }>;
  const analysisResult = await analyzePainSignals(survey.responses, questions);

  // Save analysis
  const analysis = await prisma.analysis.create({
    data: {
      surveyId,
      signalStrength: analysisResult.signalStrength,
      painFrequency: analysisResult.painFrequency,
      painIntensity: analysisResult.painIntensity,
      keyQuotes: analysisResult.keyQuotes,
      currentWorkarounds: analysisResult.currentWorkarounds,
      recommendation: analysisResult.recommendation,
      confidence: analysisResult.confidence,
      reasoning: analysisResult.reasoning,
    },
  });

  return analysis;
}

export async function getAnalysis(surveyId: string): Promise<Analysis | null> {
  return prisma.analysis.findUnique({
    where: { surveyId },
  });
}