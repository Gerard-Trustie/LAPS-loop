'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSurveyById } from '@/app/actions/surveys';

export default function SurveyCreatedPage({ params }: { params: { id: string } }) {
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<'url' | 'code' | null>(null);

  useEffect(() => {
    async function loadSurvey() {
      const data = await getSurveyById(params.id);
      setSurvey(data);
      setLoading(false);
    }
    loadSurvey();
  }, [params.id]);

  const surveyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/survey/${params.id}`;

  const copyToClipboard = async (text: string, type: 'url' | 'code') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
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

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey Created!</h1>
            <p className="text-gray-600">Your survey is ready to share</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Survey URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={surveyUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(surveyUrl, 'url')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  {copied === 'url' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Share this URL with participants (e.g., post to Prolific)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={survey.completionCode}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-lg"
                />
                <button
                  onClick={() => copyToClipboard(survey.completionCode, 'code')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  {copied === 'code' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Participants will see this code after completing the survey
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t flex gap-4">
            <Link
              href={`/surveys/${params.id}`}
              className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              View Survey Details
            </Link>
            <Link
              href="/"
              className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}