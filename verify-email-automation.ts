import { prisma } from './src/lib/prisma';

async function verify() {
  console.log('🔍 Verifying Email Automation System...\n');

  // Check templates
  const templates = await prisma.kaledEmailTemplate.count({
    where: { isLibraryTemplate: true },
  });
  console.log(`✅ Templates in library: ${templates}/11`);

  // Check sequences
  const sequences = await prisma.kaledEmailSequence.count();
  console.log(`✅ Active sequences: ${sequences}/4`);

  // Check sequence steps
  const steps = await prisma.kaledEmailSequenceStep.count();
  console.log(`✅ Sequence steps configured: ${steps}/11`);

  // List sequences
  const seqList = await prisma.kaledEmailSequence.findMany({
    select: {
      name: true,
      triggerType: true,
      isActive: true,
      _count: {
        select: {
          steps: true,
        },
      },
    },
  });

  console.log('\n📋 Sequences:');
  seqList.forEach((seq) => {
    console.log(`  - ${seq.name} (${seq.triggerType}) - ${seq._count.steps} steps`);
  });

  // List templates by phase
  const templatesByPhase = await prisma.kaledEmailTemplate.groupBy({
    by: ['phase'],
    where: { isLibraryTemplate: true },
    _count: true,
  });

  console.log('\n📧 Templates by Phase:');
  templatesByPhase.forEach((group) => {
    console.log(`  - ${group.phase || 'N/A'}: ${group._count} templates`);
  });

  console.log('\n✨ Verification complete!');

  await prisma.$disconnect();
}

verify().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
