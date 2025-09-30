'use client';

import { useState } from 'react';

interface SurveyFormProps {
  questions: string[];
  action: (formData: FormData) => Promise<void>;
}

export default function SurveyForm({ questions, action }: SurveyFormProps) {
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const isAnswerValid = (answer: string) => answer.trim().length >= 50;
  const allAnswersValid = answers.every(isAnswerValid);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!allAnswersValid) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await action(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8">
        {questions.map((question, index) => {
          const charCount = answers[index].trim().length;
          const isValid = isAnswerValid(answers[index]);
          const showError = charCount > 0 && !isValid;

          return (
            <div key={index} className="space-y-2">
              <label htmlFor={`answer-${index}`} className="block text-lg font-medium text-gray-900">
                {index + 1}. {question}
              </label>

              <textarea
                id={`answer-${index}`}
                name={`answer-${index}`}
                value={answers[index]}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  showError
                    ? 'border-red-300 bg-red-50'
                    : isValid
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
                }`}
                placeholder="Please provide a detailed answer..."
              />

              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${
                  showError
                    ? 'text-red-600'
                    : isValid
                    ? 'text-green-600'
                    : 'text-gray-500'
                }`}>
                  {charCount} / 50 characters minimum
                </span>

                {showError && (
                  <span className="text-red-600">
                    Please write at least {50 - charCount} more characters
                  </span>
                )}

                {isValid && (
                  <span className="text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Valid
                  </span>
                )}
              </div>
            </div>
          );
        })}

        <div className="pt-6 border-t">
          <button
            type="submit"
            disabled={!allAnswersValid || isSubmitting}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
              allAnswersValid && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Survey'}
          </button>

          {!allAnswersValid && (
            <p className="mt-3 text-center text-sm text-gray-600">
              Please answer all questions with at least 50 characters each
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
