import { notFound, redirect } from 'next/navigation';
import { getSurveyById } from '@/app/actions/survey-crud';
import { submitResponse } from '@/app/actions/responses';
import { generateFakeAnswers } from '@/app/actions/test-helpers';
import SurveyForm from './SurveyForm';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ PROLIFIC_PID?: string }>;
}

export default async function SurveyPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { PROLIFIC_PID } = await searchParams;
  const survey = await getSurveyById(id);

  if (!survey) {
    notFound();
  }

  const questions = survey.questions as Array<{ text: string; momTestScore?: number; issues?: string[] }>;

  async function handleSubmit(formData: FormData) {
    'use server';

    const answers = questions.map((q, index) => ({
      question: q.text,
      answer: formData.get(`answer-${index}`) as string,
    }));

    await submitResponse({
      surveyId: id,
      answers,
      prolificPid: PROLIFIC_PID,
    });

    redirect(`/survey/${id}/complete`);
  }

  async function handleGenerateFake() {
    'use server';

    return generateFakeAnswers(
      questions.map(q => q.text),
      {
        audience: survey.audience,
        hypothesis: survey.hypothesis,
      }
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{survey.title}</h1>
          <p className="text-gray-600 mb-8">
            Please answer all questions thoughtfully. Each answer should be at least 50 characters.
          </p>

          <SurveyForm
            questions={questions.map(q => q.text)}
            action={handleSubmit}
            onGenerateFakeAnswers={handleGenerateFake}
          />
        </div>
      </div>
    </div>
  );
}
