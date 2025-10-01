'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getSurveyById } from '@/app/actions/survey-crud';
import { exportResponsesCSV } from '@/app/actions/responses';
import { analyzeSurvey } from '@/app/actions/analysis';
import { ResponseList } from '@/components/ResponseList';

export default function SurveyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [showResponses, setShowResponses] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  const loadSurvey = async () => {
    const data = await getSurveyById(id);
    setSurvey(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSurvey();
  }, [id]);

  const surveyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/survey/${id}`;

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(surveyUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const handleExportCSV = async () => {
    try {
      const csv = await exportResponsesCSV(id);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `survey-${id}-responses.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export CSV');
      console.error(err);
    }
  };

  const handleAnalyze = async () => {
    if (survey.responses.length === 0) {
      setError('Need at least 1 response to analyze');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      await analyzeSurvey(id);
      await loadSurvey();
    } catch (err: any) {
      setError(err.message || 'Failed to analyze survey');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </main>
    );
  }

  if (!survey) {
    return (
      <main className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Survey not found</div>
      </main>
    );
  }

  const questions = survey.questions as Array<{ text: string; momTestScore?: number }>;
  const responseCount = survey.responses?.length || 0;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{survey.title}</h1>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Target Audience</h3>
              <p className="text-gray-900">{survey.audience}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Problem Hypothesis</h3>
              <p className="text-gray-900">{survey.hypothesis}</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>{responseCount} responses</span>
            <span>•</span>
            <span>Created {new Date(survey.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span className="font-mono">{survey.completionCode}</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Public Survey Link</h2>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={surveyUrl}
              readOnly
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white"
            />
            <button
              onClick={handleCopyUrl}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              {urlCopied ? 'Copied!' : 'Copy URL'}
            </button>
          </div>
          <div className="flex gap-4">
            <Link
              href={`/survey/${id}`}
              target="_blank"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open Survey (Preview)
            </Link>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Share this link with participants on Prolific or other platforms
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-6">Questions</h2>
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={i} className="pb-4 border-b last:border-b-0">
                <div className="flex justify-between items-start">
                  <p className="text-gray-900">
                    <span className="font-medium">{i + 1}.</span> {q.text}
                  </p>
                  {q.momTestScore && (
                    <span className="ml-4 text-sm text-gray-500">{q.momTestScore}/100</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-6">Responses ({responseCount})</h2>
          {responseCount > 0 && (
            <button
              onClick={() => setShowResponses(!showResponses)}
              className="mb-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              {showResponses ? 'Hide Responses' : 'View Responses'}
            </button>
          )}
          {showResponses && <ResponseList responses={survey.responses || []} />}
        </div>

        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-6">Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={handleExportCSV}
              disabled={responseCount === 0}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
            >
              Export CSV
            </button>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleAnalyze}
                disabled={responseCount === 0 || analyzing}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
              >
                {analyzing
                  ? 'Analyzing...'
                  : responseCount === 0
                  ? 'Analyze (0 responses)'
                  : survey.analysis
                  ? `Re-analyze Pain Signals (${responseCount} response${responseCount === 1 ? '' : 's'})`
                  : `Analyze Pain Signals (${responseCount} response${responseCount === 1 ? '' : 's'})`}
              </button>
              {responseCount > 0 && responseCount < 30 && !analyzing && (
                <p className="text-sm text-orange-600">
                  ⚠️ Low sample size (N={responseCount}). Analysis confidence will be limited. 30+ responses recommended.
                </p>
              )}
            </div>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {survey.analysis && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold">Pain Signal Analysis</h2>
              <p className="text-sm text-gray-500">
                Last analyzed: {new Date(survey.analysis.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Signal Strength</h3>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-lg font-semibold ${
                    survey.analysis.signalStrength === 'strong'
                      ? 'bg-green-100 text-green-800'
                      : survey.analysis.signalStrength === 'weak'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {survey.analysis.signalStrength.toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Pain Frequency</h3>
                <p className="text-3xl font-bold text-gray-900">{survey.analysis.painFrequency}%</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Pain Intensity</h3>
                <p className="text-3xl font-bold text-gray-900 capitalize">
                  {survey.analysis.painIntensity}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Quotes</h3>
                <div className="space-y-2">
                  {(survey.analysis.keyQuotes as string[]).map((quote, i) => (
                    <div key={i} className="pl-4 border-l-4 border-blue-500 py-2">
                      <p className="text-gray-700 italic">{quote}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Workarounds</h3>
                <ul className="list-disc list-inside space-y-1">
                  {(survey.analysis.currentWorkarounds as string[]).map((workaround, i) => (
                    <li key={i} className="text-gray-700">
                      {workaround}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendation</h3>
                <p className="text-gray-700">{survey.analysis.recommendation}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Reasoning</h3>
                <p className="text-gray-700">{survey.analysis.reasoning}</p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Confidence: <span className="font-medium capitalize">{survey.analysis.confidence}</span>
                  {' • '}
                  Analyzed on {new Date(survey.analysis.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
