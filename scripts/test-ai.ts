import { generateQuestions } from '../lib/ai/generateQuestions';
import { critiqueQuestions } from '../lib/ai/critiqueQuestions';

async function main() {
  console.log('🤖 Testing AI Functions\n');

  // Test data
  const audience = 'SaaS founders building B2B products';
  const hypothesis = 'Founders struggle to validate feature ideas before building them, leading to wasted development time';

  try {
    // Test question generation
    console.log('1. Generating questions...');
    const questions = await generateQuestions(audience, hypothesis);
    console.log(`✅ Generated ${questions.length} questions\n`);

    // Test question critique
    console.log('2. Critiquing questions...');
    const critiquedQuestions = await critiqueQuestions(questions);
    console.log('✅ Questions critiqued\n');

    // Display results
    console.log('📊 Results:');
    console.log('─'.repeat(80));
    critiquedQuestions.forEach((q, i) => {
      console.log(`\nQ${i + 1}: ${q.text}`);
      console.log(`Score: ${q.momTestScore}/100`);
      if (q.issues.length > 0) {
        console.log(`Issues: ${q.issues.join(', ')}`);
      }
    });
    console.log('\n' + '─'.repeat(80));

    const avgScore = critiquedQuestions.reduce((sum, q) => sum + q.momTestScore, 0) / critiquedQuestions.length;
    console.log(`\n📈 Average Score: ${avgScore.toFixed(1)}/100`);
    console.log(avgScore >= 80 ? '✅ Pass: Questions meet >80% threshold' : '⚠️  Warning: Questions below 80% threshold');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
