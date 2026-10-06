import { NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import dbConnect from '../../../../../lib/db';
import FaqSuggestion from '../../../../../models/FaqSuggestion';
import Faq from '../../../../../models/Faq';
import { getOrGenerateFaqEmbedding } from '../../../../../lib/embeddings';

// PUT /api/faq-suggestions/[id]/approve (Admin only)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin role required.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { adminReview } = body;

    await dbConnect();

    const suggestion = await FaqSuggestion.findById(id);

    if (!suggestion) {
      return NextResponse.json({ message: 'FAQ suggestion not found' }, { status: 404 });
    }

    if (suggestion.status !== 'Pending') {
      return NextResponse.json({ message: 'Suggestion has already been reviewed' }, { status: 400 });
    }

    // 1. Update suggestion
    suggestion.status = 'Approved';
    suggestion.adminReview = adminReview || 'Approved by administrator.';
    await suggestion.save();

    // 2. Insert into real FAQs with embedding
    let embedding: number[] | undefined;
    let embeddingHash: string | undefined;

    try {
      const embRes = await getOrGenerateFaqEmbedding({
        question: suggestion.question,
        answer: suggestion.suggestedAnswer,
        category: suggestion.category,
      });
      embedding = embRes.embedding;
      embeddingHash = embRes.embeddingHash;
    } catch (embErr) {
      console.warn('Embedding generation skipped on suggestion approval:', embErr);
    }

    const newFaq = await Faq.create({
      question: suggestion.question,
      answer: suggestion.suggestedAnswer,
      category: suggestion.category,
      ...(embedding && embeddingHash ? { embedding, embeddingHash } : {}),
    });

    return NextResponse.json(
      { message: 'Suggestion approved and converted to real FAQ', suggestion, faq: newFaq },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error approving suggestion:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
