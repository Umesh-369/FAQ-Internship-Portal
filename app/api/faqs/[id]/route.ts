import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import dbConnect from '../../../../lib/db';
import Faq from '../../../../models/Faq';
import { getOrGenerateFaqEmbedding } from '../../../../lib/embeddings';

// PUT /api/faqs/[id] (Admin only)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin role required.' }, { status: 401 });
    }

    const { id } = await params;
    const { question, answer, category } = await req.json();

    if (!question || !answer || !category) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const existingFaq = await Faq.findById(id).select('+embedding +embeddingHash');
    if (!existingFaq) {
      return NextResponse.json({ message: 'FAQ not found' }, { status: 404 });
    }

    let embedding = existingFaq.embedding;
    let embeddingHash = existingFaq.embeddingHash;

    try {
      const embRes = await getOrGenerateFaqEmbedding({
        question,
        answer,
        category,
        embedding: existingFaq.embedding,
        embeddingHash: existingFaq.embeddingHash,
      });
      embedding = embRes.embedding;
      embeddingHash = embRes.embeddingHash;
    } catch (embErr) {
      console.warn('Embedding update skipped on FAQ edit:', embErr);
    }

    const updatedFaq = await Faq.findByIdAndUpdate(
      id,
      {
        question,
        answer,
        category,
        ...(embedding && embeddingHash ? { embedding, embeddingHash } : {}),
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedFaq, { status: 200 });
  } catch (error: any) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/faqs/[id] (Admin only)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin role required.' }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const deletedFaq = await Faq.findByIdAndDelete(id);

    if (!deletedFaq) {
      return NextResponse.json({ message: 'FAQ not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'FAQ deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
