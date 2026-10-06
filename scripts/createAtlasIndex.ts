import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

async function createAtlasVectorIndex() {
  console.log('🔍 Checking MongoDB Atlas connection and creating Search Index...');
  try {
    const dbConnect = (await import('../lib/db')).default;
    const mongoose = (await import('mongoose')).default;
    const Faq = (await import('../models/Faq')).default;

    await dbConnect();
    console.log('✅ Connected to MongoDB.');

    const collection = Faq.collection;

    const indexDefinition = {
      name: process.env.ATLAS_VECTOR_INDEX || 'vector_index',
      type: 'vectorSearch',
      definition: {
        fields: [
          {
            type: 'vector',
            path: 'embedding',
            numDimensions: 384,
            similarity: 'cosine',
          },
        ],
      },
    };

    console.log(`Creating Search Index "${indexDefinition.name}" on collection "${collection.collectionName}"...`);
    
    // Mongoose collection exposes driver methods
    if (typeof (collection as any).createSearchIndex === 'function') {
      const result = await (collection as any).createSearchIndex(indexDefinition);
      console.log(`🎉 Search Index created successfully:`, result);
    } else {
      console.log('ℹ️ createSearchIndex not directly supported by current driver instance or local DB. Ensure MongoDB Atlas Vector Search index is created via Atlas UI with:');
      console.log(JSON.stringify(indexDefinition, null, 2));
    }

    process.exit(0);
  } catch (error: any) {
    console.error('⚠️ Note / Error while creating Atlas Search Index:', error.message);
    console.log('\nIf running locally or without Atlas admin permissions, you can create the Search Index manually in Atlas or set VECTOR_MODE=memory in .env.local.');
    process.exit(0);
  }
}

createAtlasVectorIndex();
