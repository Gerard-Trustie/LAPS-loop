'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateSurveyQuestions } from '@/app/actions/surveys';
import { createSurvey } from '@/app/actions/survey-crud';
import { Question } from '@/lib/types';

export default function NewSurveyPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'review'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleGenerateQuestions = async () => {
    if (!title || !audience || !hypothesis) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const generated = await generateSurveyQuestions(audience, hypothesis);
      setQuestions(generated);
      setStep('review');
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSurvey = async () => {
    setLoading(true);
    setError('');

    try {
      const survey = await createSurvey({
        title,
        audience,
        hypothesis,
        questions,
      });

      router.push(`/surveys/${survey.id}/created`);
    } catch (err) {
      setError('Failed to create survey. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  if (step === 'review') {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setStep('form')}
            className="text-blue-600 hover:text-blue-700 mb-6 flex items-center gap-2"
          >
            &larr; Back to form
          </button>

          <div className="bg-white rounded-lg shadow p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600 mb-4">{hypothesis}</p>
            <p className="text-sm text-gray-500">Target audience: {audience}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-semibold mb-6">Review Questions</h2>

            {questions.map((q, i) => (
              <div key={i} className="mb-6 pb-6 border-b last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">Question {i + 1}</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${
                        q.momTestScore >= 80
                          ? 'bg-green-100 text-green-800'
                          : q.momTestScore >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {q.momTestScore}/100
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{q.text}</p>
                {q.issues.length > 0 && (
                  <div className="text-sm text-orange-600">
                    Issues: {q.issues.join(', ')}
                  </div>
                )}
              </div>
            ))}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleCreateSurvey}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              {loading ? 'Creating Survey...' : 'Create Survey'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Create New Survey</h1>

        <div className="bg-white rounded-lg shadow p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Survey Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Feature Validation for Money Moods"
              />
            </div>

            <div>
              <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <textarea
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your target users (e.g., SaaS founders building B2B products)"
              />
            </div>

            <div>
              <label htmlFor="hypothesis" className="block text-sm font-medium text-gray-700 mb-2">
                Problem Hypothesis
              </label>
              <textarea
                id="hypothesis"
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What problem do you think they have? (e.g., Founders struggle to validate feature ideas before building)"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerateQuestions}
              disabled={loading || !title || !audience || !hypothesis}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              {loading ? 'Generating Questions...' : 'Generate Questions'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}