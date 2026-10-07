import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import dbConnect from '../../../lib/db';
import Query from '../../../models/Query';

// GET /api/queries (Protected: Students get their own, Admin gets all)
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    await dbConnect();

    let queries;
    if (session.user.role === 'admin') {
      // Admin gets all queries, sorted newest first
      queries = await Query.find({}).sort({ createdAt: -1 }).lean();
    } else {
      // Standard student gets their own queries
      queries = await Query.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
    }

    const response = NextResponse.json(queries, { status: 200 });
    response.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');

    return response;
  } catch (error: any) {
    console.error('Error fetching queries:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/queries (Logged-in users can submit queries)
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { name, email, category, subject, message, priority } = await req.json();

    if (!name || !email || !category || !subject || !message) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const newQuery = await Query.create({
      userId: session.user.id,
      name,
      email: email.toLowerCase(),
      category,
      subject,
      message,
      priority: priority || 'Medium',
      status: 'Pending',
    });

    return NextResponse.json(newQuery, { status: 201 });
  } catch (error: any) {
    console.error('Error raising query:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
