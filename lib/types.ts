import { Survey, Response, Analysis } from '@prisma/client';

// Base types from Prisma
export type { Survey, Response, Analysis };

// Extended types with relations
export type SurveyWithResponses = Survey & {
  responses: Response[];
};

export type SurveyWithAnalysis = Survey & {
  analysis: Analysis | null;
};

export type SurveyWithAll = Survey & {
  responses: Response[];
  analysis: Analysis | null;
};

// Question types
export interface Question {
  text: string;
  momTestScore: number;
  issues: string[];
}

// Input types for Server Actions
export interface CreateSurveyInput {
  title: string;
  audience: string;
  hypothesis: string;
  questions: Question[];
  completionCode: string;
}

export interface SubmitResponseInput {
  surveyId: string;
  answers: { question: string; answer: string }[];
  prolificPid?: string;
}

// Analysis result types
export interface AnalysisResult {
  signalStrength: 'strong' | 'weak' | 'none';
  painFrequency: number;
  painIntensity: 'high' | 'medium' | 'low';
  keyQuotes: string[];
  currentWorkarounds: string[];
  recommendation: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}
