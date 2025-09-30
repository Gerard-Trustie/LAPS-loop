import { prisma } from '@/lib/db/prisma';

async function main() {
  try {
    const count = await prisma.survey.count();
    console.log('✅ Database connected successfully!');
    console.log(`Survey count: ${count}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
