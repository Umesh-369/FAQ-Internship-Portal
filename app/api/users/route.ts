import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import dbConnect from '../../../lib/db';
import User from '../../../models/User';

// GET /api/users (Admin only)
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin role required.' }, { status: 401 });
    }

    await dbConnect();

    // Select name, email, role, and createdAt fields, excluding password
    const users = await User.find({})
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const response = NextResponse.json(users, { status: 200 });
    response.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=30');

    return response;
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
