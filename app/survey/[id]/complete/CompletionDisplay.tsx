'use client';

import { useState } from 'react';

interface CompletionDisplayProps {
  completionCode: string;
}

export default function CompletionDisplay({ completionCode }: CompletionDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(completionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Your Completion Code
        </p>
        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
          <p className="text-4xl md:text-5xl font-bold text-gray-900 font-mono tracking-wider">
            {completionCode}
          </p>
        </div>
      </div>

      <button
        onClick={handleCopy}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
          copied
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {copied ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Copied to Clipboard!
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Code to Clipboard
          </span>
        )}
      </button>
    </div>
  );
}
