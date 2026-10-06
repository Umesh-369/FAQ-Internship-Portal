import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import dbConnect from '../../../lib/db';
import ChatHistory from '../../../models/ChatHistory';
import { generateEmbedding } from '../../../lib/embeddings';
import { searchFaqsByVector, getSimilarityThreshold, VectorSearchResult } from '../../../lib/vectorSearch';
import { searchFaqsByKeyword } from '../../../lib/keywordSearch';
import { generateGroundedAnswer, PORTAL_FALLBACK_MESSAGE } from '../../../lib/openrouter';
import { checkRateLimit } from '../../../lib/rateLimit';

// Fire-and-forget: save chat history safely using authenticated user session
function saveChatHistoryAsync(userId: string, userMessage: string, botAnswer: string) {
  const userExchange = [
    { sender: 'user', text: userMessage, timestamp: new Date() },
    { sender: 'bot', text: botAnswer, timestamp: new Date() },
  ];

  ChatHistory.findOne({ userId })
    .then((existingHistory) => {
      if (existingHistory) {
        existingHistory.messages.push(...(userExchange as any));
        return existingHistory.save();
      } else {
        return ChatHistory.create({
          userId,
          messages: userExchange,
        });
      }
    })
    .catch((dbErr) => {
      console.error('Failed to save chat history:', dbErr);
    });
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate user from session (do NOT trust client-supplied userId)
    const session = await auth();
    const authenticatedUserId = session?.user?.id;

    // 2. Per-user or per-IP rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const rateLimitKey = authenticatedUserId ? `user:${authenticatedUserId}` : `ip:${clientIp}`;
    const { allowed } = checkRateLimit(rateLimitKey);

    if (!allowed) {
      return NextResponse.json(
        {
          answer: 'You have sent too many requests. Please wait a moment before trying again.',
          suggestions: [],
          sources: [],
          isFallback: true,
        },
        { status: 429 }
      );
    }

    // 3. Parse and validate request body
    const body = await req.json().catch(() => ({}));
    const rawMessage = body?.message;

    if (!rawMessage || typeof rawMessage !== 'string' || !rawMessage.trim()) {
      return NextResponse.json({ message: 'Message is required and cannot be empty.' }, { status: 400 });
    }

    const userMessage = rawMessage.trim().slice(0, 1000); // Sanitize max length

    await dbConnect();

    // 4. Generate query embedding and perform vector search
    let matchingFaqs: VectorSearchResult[] = [];
    const threshold = getSimilarityThreshold();

    try {
      const queryEmbedding = await generateEmbedding(userMessage);
      const vectorResults = await searchFaqsByVector(queryEmbedding, 5);

      // Filter by similarity threshold
      matchingFaqs = vectorResults.filter((r) => r.score >= threshold);
    } catch (vectorError: any) {
      console.warn('Vector embedding/search failed, trying keyword fallback:', vectorError.message);
    }

    // 5. Keyword search fallback if vector search yielded no qualifying results
    if (matchingFaqs.length === 0) {
      const keywordResults = await searchFaqsByKeyword(userMessage, 3);
      if (keywordResults.length > 0) {
        matchingFaqs = keywordResults.map((kr) => ({
          id: kr.id,
          question: kr.question,
          answer: kr.answer,
          category: kr.category,
          score: Math.min(0.9, 0.65 + (kr.score * 0.05)), // Estimate normalized score for keyword hits
        }));
      }
    }

    // 6. If no FAQs matched, return fallback response
    if (matchingFaqs.length === 0) {
      const fallbackResponse = {
        answer: PORTAL_FALLBACK_MESSAGE,
        suggestions: [
          { question: 'What is VINS?' },
          { question: 'How do I submit the NOC?' },
          { question: 'What is the Rosetta journal?' },
        ],
        sources: [],
        isFallback: true,
      };

      if (authenticatedUserId) {
        saveChatHistoryAsync(authenticatedUserId, userMessage, fallbackResponse.answer);
      }

      return NextResponse.json(fallbackResponse, { status: 200 });
    }

    // 7. Generate grounded answer with OpenRouter using top relevant FAQs
    const topFaqs = matchingFaqs.slice(0, 4);
    const generation = await generateGroundedAnswer(userMessage, topFaqs);

    const answer = generation.answer;
    const isFallback = generation.isFallback;

    // Format sources
    const sources = topFaqs.map((f) => ({
      id: f.id,
      question: f.question,
      category: f.category,
      score: Number(f.score.toFixed(3)),
    }));

    // Generate follow-up suggestions from retrieved FAQs or alternate questions
    const suggestions = matchingFaqs
      .slice(1, 4)
      .map((f) => ({ question: f.question }));

    // 8. Save chat history non-blocking if user is authenticated
    if (authenticatedUserId) {
      saveChatHistoryAsync(authenticatedUserId, userMessage, answer);
    }

    return NextResponse.json(
      {
        answer,
        suggestions,
        sources,
        isFallback,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      {
        answer: PORTAL_FALLBACK_MESSAGE,
        suggestions: [],
        sources: [],
        isFallback: true,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
