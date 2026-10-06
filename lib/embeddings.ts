import crypto from 'crypto';

// Global singleton for the embedding pipeline to prevent reloading model on every request
let embeddingPipelinePromise: Promise<any> | null = null;

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';

async function getEmbeddingPipeline() {
  if (!embeddingPipelinePromise) {
    embeddingPipelinePromise = (async () => {
      const { pipeline, env } = await import('@xenova/transformers');
      // Disable remote telemetry / unnecessary checks if any
      env.allowLocalModels = true;
      return pipeline('feature-extraction', MODEL_NAME);
    })();
  }
  return embeddingPipelinePromise;
}

/**
 * Combines FAQ fields into a standard representation for embedding
 */
export function computeFaqEmbeddingText(faq: {
  question: string;
  category?: string;
  answer: string;
}): string {
  const q = faq.question ? faq.question.trim() : '';
  const c = faq.category ? faq.category.trim() : 'General';
  const a = faq.answer ? faq.answer.trim() : '';
  return `Question: ${q}\nCategory: ${c}\nAnswer: ${a}`;
}

/**
 * Computes a SHA-256 hash of the embedded text to track changes
 */
export function computeEmbeddingHash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Generates a 384-dimensional normalized embedding vector for a given string
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await getEmbeddingPipeline();
  const cleanText = text.trim();
  if (!cleanText) {
    throw new Error('Cannot generate embedding for empty text');
  }
  const output = await extractor(cleanText, {
    pooling: 'mean',
    normalize: true,
  });
  return Array.from(output.data);
}

/**
 * Checks whether an FAQ's embedding is up to date, and generates a new one if missing or modified.
 */
export async function getOrGenerateFaqEmbedding(faq: {
  question: string;
  category?: string;
  answer: string;
  embedding?: number[];
  embeddingHash?: string;
}): Promise<{ embedding: number[]; embeddingHash: string; updated: boolean }> {
  const embeddingText = computeFaqEmbeddingText(faq);
  const newHash = computeEmbeddingHash(embeddingText);

  if (
    faq.embeddingHash === newHash &&
    faq.embedding &&
    Array.isArray(faq.embedding) &&
    faq.embedding.length === 384
  ) {
    return {
      embedding: faq.embedding,
      embeddingHash: faq.embeddingHash,
      updated: false,
    };
  }

  const embedding = await generateEmbedding(embeddingText);
  return {
    embedding,
    embeddingHash: newHash,
    updated: true,
  };
}
