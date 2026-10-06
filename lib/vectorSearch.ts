import Faq from '../models/Faq';

export interface VectorSearchResult {
  id: string;
  question: string;
  answer: string;
  category: string;
  score: number;
}

export const DEFAULT_SIMILARITY_THRESHOLD = 0.65;

export function getSimilarityThreshold(): number {
  if (process.env.SIMILARITY_THRESHOLD) {
    const parsed = parseFloat(process.env.SIMILARITY_THRESHOLD);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
      return parsed;
    }
  }
  return DEFAULT_SIMILARITY_THRESHOLD;
}

/**
 * Computes cosine similarity between two normalized vectors.
 * Returns normalized score between 0 and 1: (1 + dotProduct) / 2
 */
export function computeCosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
  }
  // Clamp between -1 and 1 to prevent floating point inaccuracies
  const clampedDot = Math.max(-1, Math.min(1, dotProduct));
  // Normalize to 0..1 range (consistent with Atlas vectorSearchScore for cosine)
  return (1 + clampedDot) / 2;
}

/**
 * In-memory vector search over stored FAQ embeddings in MongoDB
 */
export async function searchFaqsInMemory(
  queryEmbedding: number[],
  limit: number = 5
): Promise<VectorSearchResult[]> {
  const faqs = await Faq.find({}, '+embedding').lean();

  const scored: VectorSearchResult[] = [];

  for (const faq of faqs as any[]) {
    if (faq.embedding && Array.isArray(faq.embedding) && faq.embedding.length === queryEmbedding.length) {
      const score = computeCosineSimilarity(queryEmbedding, faq.embedding);
      scored.push({
        id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        score,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

/**
 * MongoDB Atlas $vectorSearch
 */
export async function searchFaqsAtlas(
  queryEmbedding: number[],
  limit: number = 5
): Promise<VectorSearchResult[]> {
  const indexName = process.env.ATLAS_VECTOR_INDEX || 'vector_index';

  const pipeline = [
    {
      $vectorSearch: {
        index: indexName,
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: Math.max(limit * 10, 25),
        limit,
      },
    },
    {
      $project: {
        _id: 1,
        question: 1,
        answer: 1,
        category: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ];

  const results = await Faq.aggregate(pipeline);

  return results.map((r: any) => ({
    id: r._id.toString(),
    question: r.question,
    answer: r.answer,
    category: r.category,
    score: typeof r.score === 'number' ? r.score : 0,
  }));
}

/**
 * Unified FAQ Vector Search:
 * Uses Atlas Vector Search if VECTOR_MODE=atlas, with automatic fallback to in-memory search.
 */
export async function searchFaqsByVector(
  queryEmbedding: number[],
  limit: number = 5
): Promise<VectorSearchResult[]> {
  const mode = (process.env.VECTOR_MODE || 'atlas').toLowerCase();

  if (mode === 'atlas') {
    try {
      const atlasResults = await searchFaqsAtlas(queryEmbedding, limit);
      if (atlasResults && atlasResults.length > 0) {
        return atlasResults;
      }
      // If Atlas index is not built or empty, gracefully fallback to in-memory cosine search
      return await searchFaqsInMemory(queryEmbedding, limit);
    } catch (atlasError: any) {
      console.warn(
        '⚠️ MongoDB Atlas Vector Search failed or index not available. Falling back to in-memory cosine search.',
        atlasError.message
      );
      return await searchFaqsInMemory(queryEmbedding, limit);
    }
  }

  return await searchFaqsInMemory(queryEmbedding, limit);
}
