import Link from 'next/link';
import { getSurveys } from './actions/survey-crud';
import { getResponseCount } from './actions/responses';

export default async function Home() {
  const surveys = await getSurveys();

  // Fetch response counts for all surveys in parallel
  const surveysWithCounts = await Promise.all(
    surveys.map(async (survey) => ({
      ...survey,
      responseCount: await getResponseCount(survey.id),
    }))
  );

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">shouldability.ai</h1>
            <p className="text-gray-600 mt-2">AI-powered pain signal detection</p>
          </div>
          <Link
            href="/surveys/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Create New Survey
          </Link>
        </div>

        {surveysWithCounts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No surveys yet</h2>
            <p className="text-gray-600 mb-6">Create your first survey to get started</p>
            <Link
              href="/surveys/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Create Survey
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {surveysWithCounts.map((survey) => (
              <Link
                key={survey.id}
                href={`/surveys/${survey.id}`}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-6 block"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {survey.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {survey.hypothesis}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>{survey.responseCount} responses</span>
                      <span>•</span>
                      <span>Created {new Date(survey.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="text-blue-600 font-medium">View →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}