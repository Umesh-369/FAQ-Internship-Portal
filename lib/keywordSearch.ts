import Faq from '../models/Faq';

// Common stop words to filter out before searching
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
  'is', 'am', 'are', 'was', 'were', 'be', 'being',
  'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
  'a', 'an', 'the', 'and', 'but', 'if', 'or', 'so', 'as', 'of',
  'at', 'by', 'for', 'with', 'about', 'to', 'from', 'in', 'on',
  'will', 'would', 'can', 'could', 'should', 'shall', 'may', 'might',
  'not', 'no', 'nor', 'don', 'doesn', 'didn', 'won', 'wouldn',
  'there', 'here', 'when', 'where', 'why', 'how', 'all', 'any',
  'both', 'each', 'more', 'most', 'some', 'such', 'than', 'too',
  'very', 'just', 'also', 'only', 'own', 'same', 'tell', 'get',
  'please', 'hi', 'hello', 'hey', 'thanks', 'thank',
]);

const MIN_TEXT_SCORE = 1.5;

export function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

export interface KeywordSearchResult {
  id: string;
  question: string;
  answer: string;
  category: string;
  score: number;
}

/**
 * Searches FAQs using MongoDB $text index with regex fallback.
 */
export async function searchFaqsByKeyword(message: string, limit: number = 5): Promise<KeywordSearchResult[]> {
  const keywords = extractKeywords(message);
  if (keywords.length === 0) {
    return [];
  }

  // 1. Try MongoDB $text search
  const searchQuery = keywords.join(' ');
  const rawMatches = await Faq.find(
    { $text: { $search: searchQuery } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .lean();

  const textMatches = rawMatches
    .filter((m: any) => m.score >= MIN_TEXT_SCORE)
    .map((m: any) => ({
      id: m._id.toString(),
      question: m.question,
      answer: m.answer,
      category: m.category,
      score: m.score,
    }));

  if (textMatches.length > 0) {
    return textMatches;
  }

  // 2. Fallback: regex search on question field
  const regexPatterns = keywords.map((kw) => new RegExp(kw, 'i'));
  const minKeywordMatch = Math.min(keywords.length, 2);
  const regexResults = await Faq.find({
    question: { $in: regexPatterns },
  })
    .limit(10)
    .lean();

  const scored = regexResults
    .map((faq: any) => {
      const q = faq.question.toLowerCase();
      const hitCount = keywords.filter((kw) => q.includes(kw)).length;
      return { faq, hitCount };
    })
    .filter((item) => item.hitCount >= minKeywordMatch)
    .sort((a, b) => b.hitCount - a.hitCount);

  return scored.slice(0, limit).map((item) => ({
    id: item.faq._id.toString(),
    question: item.faq.question,
    answer: item.faq.answer,
    category: item.faq.category,
    score: item.hitCount,
  }));
}
