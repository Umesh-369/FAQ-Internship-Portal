import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import dbConnect from '../../../lib/db';
import Faq from '../../../models/Faq';
import { getOrGenerateFaqEmbedding } from '../../../lib/embeddings';

// GET /api/faqs
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    await dbConnect();

    let query: any = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // If text search, sort by text score relevance
    let faqs;
    if (search) {
      faqs = await Faq.find(query)
        .select({ score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .lean();
    } else {
      faqs = await Faq.find(query).sort({ createdAt: -1 }).lean();
    }

    const response = NextResponse.json(faqs, { status: 200 });

    // Cache non-search results for 30s, search results for 10s
    if (!search) {
      response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    } else {
      response.headers.set('Cache-Control', 'public, max-age=10, stale-while-revalidate=30');
    }

    return response;
  } catch (error: any) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/faqs (Admin only)
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin role required.' }, { status: 401 });
    }

    const { question, answer, category } = await req.json();

    if (!question || !answer || !category) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    let embedding: number[] | undefined;
    let embeddingHash: string | undefined;

    try {
      const embRes = await getOrGenerateFaqEmbedding({ question, answer, category });
      embedding = embRes.embedding;
      embeddingHash = embRes.embeddingHash;
    } catch (embErr) {
      console.warn('Embedding generation skipped on FAQ create:', embErr);
    }

    const newFaq = await Faq.create({
      question,
      answer,
      category,
      ...(embedding && embeddingHash ? { embedding, embeddingHash } : {}),
    });

    return NextResponse.json(newFaq, { status: 201 });
  } catch (error: any) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
