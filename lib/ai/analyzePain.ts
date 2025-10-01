import { openai } from './openai';
import { PAIN_ANALYZER_PROMPT } from './prompts';
import { Response } from '@prisma/client';
import { AnalysisResult } from '../types';

export async function analyzePainSignals(
  responses: Response[],
  surveyQuestions: Array<{ text: string }>
): Promise<AnalysisResult> {
  try {
    if (responses.length === 0) {
      throw new Error('Need at least 1 response to analyze');
    }

    // Format questions
    const questionsText = surveyQuestions
      .map((q, i) => `Q${i + 1}: ${q.text}`)
      .join('\n');

    // Format responses (sample up to 50 to avoid token limits)
    const responsesToAnalyze = responses.slice(0, 50);
    const responsesText = responsesToAnalyze
      .map((r, i) => {
        const answers = r.answers as Array<{ question: string; answer: string }>;
        const answersFormatted = answers
          .map((a, j) => `  Q${j + 1}: ${a.answer}`)
          .join('\n');
        return `Response ${i + 1}:\n${answersFormatted}`;
      })
      .join('\n\n');

    const prompt = PAIN_ANALYZER_PROMPT
      .replace('{questions}', questionsText)
      .replace('{responseCount}', responsesToAnalyze.length.toString())
      .replace('{responses}', responsesText);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing customer research. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Low temp for consistent analysis
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

    // Validate and return the analysis
    return {
      signalStrength: parsed.signalStrength || 'weak',
      painFrequency: parsed.painFrequency || 0,
      painIntensity: parsed.painIntensity || 'low',
      keyQuotes: parsed.keyQuotes || [],
      currentWorkarounds: parsed.currentWorkarounds || [],
      recommendation: parsed.recommendation || 'Insufficient data for recommendation',
      confidence: parsed.confidence || 'low',
      reasoning: parsed.reasoning || 'Analysis incomplete',
    };

  } catch (error) {
    console.error('Error analyzing pain signals:', error);
    throw error;
  }
}
