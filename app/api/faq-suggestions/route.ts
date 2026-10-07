import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import dbConnect from '../../../lib/db';
import FaqSuggestion from '../../../models/FaqSuggestion';

// GET /api/faq-suggestions (Protected: Student gets own, Admin gets all)
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    await dbConnect();

    let suggestions;
    if (session.user?.role === 'admin') {
      // Admin gets all suggestions
      suggestions = await FaqSuggestion.find({})
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .lean();
    } else {
      // Student gets their own suggestions
      suggestions = await FaqSuggestion.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .lean();
    }

    const response = NextResponse.json(suggestions, { status: 200 });
    response.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');

    return response;
  } catch (error: any) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/faq-suggestions (Logged-in users)
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { question, suggestedAnswer, category, description } = await req.json();

    if (!question || !suggestedAnswer || !category) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const newSuggestion = await FaqSuggestion.create({
      userId: session.user.id,
      question,
      suggestedAnswer,
      category,
      description,
      status: 'Pending',
    });

    return NextResponse.json(newSuggestion, { status: 201 });
  } catch (error: any) {
    console.error('Error creating suggestion:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
