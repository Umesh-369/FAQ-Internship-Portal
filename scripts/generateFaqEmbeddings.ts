import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { getOrGenerateFaqEmbedding } from '../lib/embeddings';

async function generateFaqEmbeddings() {
  console.log('🚀 Starting FAQ embedding backfill...');
  try {
    const dbConnect = (await import('../lib/db')).default;
    const Faq = (await import('../models/Faq')).default;

    await dbConnect();
    console.log('✅ Connected to MongoDB.');

    const faqs = await Faq.find({}, '+embedding +embeddingHash');
    console.log(`Found ${faqs.length} FAQs in database.`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < faqs.length; i++) {
      const faq = faqs[i];
      const { embedding, embeddingHash, updated } = await getOrGenerateFaqEmbedding({
        question: faq.question,
        category: faq.category,
        answer: faq.answer,
        embedding: faq.embedding,
        embeddingHash: faq.embeddingHash,
      });

      if (updated) {
        faq.embedding = embedding;
        faq.embeddingHash = embeddingHash;
        await faq.save();
        updatedCount++;
        console.log(`[${i + 1}/${faqs.length}] Updated embedding for: "${faq.question.slice(0, 40)}..."`);
      } else {
        skippedCount++;
        console.log(`[${i + 1}/${faqs.length}] Already up to date: "${faq.question.slice(0, 40)}..."`);
      }
    }

    console.log('\n======================================');
    console.log(`🎉 Embedding process complete!`);
    console.log(`Total FAQs: ${faqs.length}`);
    console.log(`Newly embedded / updated: ${updatedCount}`);
    console.log(`Skipped (unchanged): ${skippedCount}`);
    console.log('======================================\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to generate FAQ embeddings:', error);
    process.exit(1);
  }
}

generateFaqEmbeddings();
