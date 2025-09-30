'use client';

import { useState } from 'react';

interface Answer {
  question: string;
  answer: string;
}

interface Response {
  id: string;
  answers: Answer[];
  prolificPid: string | null;
  completedAt: Date;
}

interface ResponseListProps {
  responses: Response[];
}

export function ResponseList({ responses }: ResponseListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (responses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No responses yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {responses.map((response, index) => {
        const isExpanded = expandedId === response.id;
        const timestamp = new Date(response.completedAt).toLocaleString();

        return (
          <div
            key={response.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleExpanded(response.id)}
              className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-900">
                  Response #{index + 1}
                </span>
                {response.prolificPid && (
                  <span className="text-sm text-gray-500">
                    Prolific ID: {response.prolificPid}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{timestamp}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>

            {isExpanded && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="space-y-6">
                  {response.answers.map((answer, answerIndex) => (
                    <div key={answerIndex}>
                      <h4 className="font-medium text-gray-900 mb-2">
                        {answer.question}
                      </h4>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {answer.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
