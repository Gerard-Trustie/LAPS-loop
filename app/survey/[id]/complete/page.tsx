import { notFound } from 'next/navigation';
import { getSurveyById } from '@/app/actions/survey-crud';
import CompletionDisplay from './CompletionDisplay';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompletePage({ params }: PageProps) {
  const { id } = await params;
  const survey = await getSurveyById(id);

  if (!survey) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Thank You Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thank You!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your response has been successfully submitted.
          </p>

          {/* Completion Code Display */}
          <CompletionDisplay completionCode={survey.completionCode} />

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Next step:</strong> Return to Prolific and enter the code above to complete your submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
