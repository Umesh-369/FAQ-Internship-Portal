import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import dbConnect from '../../../../lib/db';
import Faq from '../../../../models/Faq';
import Query from '../../../../models/Query';
import FaqSuggestion from '../../../../models/FaqSuggestion';
import User from '../../../../models/User';

// GET /api/admin/stats (Admin only)
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin role required.' }, { status: 401 });
    }

    await dbConnect();

    // Run ALL DB queries in parallel instead of sequentially
    const [
      faqsCount,
      usersCount,
      queriesPending,
      queriesInProgress,
      queriesSolved,
      suggestionsPending,
      suggestionsApproved,
      suggestionsRejected,
      queriesByCategory,
      faqsByCategory,
      queriesByPriority,
    ] = await Promise.all([
      Faq.countDocuments(),
      User.countDocuments(),
      Query.countDocuments({ status: 'Pending' }),
      Query.countDocuments({ status: 'In Progress' }),
      Query.countDocuments({ status: 'Solved' }),
      FaqSuggestion.countDocuments({ status: 'Pending' }),
      FaqSuggestion.countDocuments({ status: 'Approved' }),
      FaqSuggestion.countDocuments({ status: 'Rejected' }),
      Query.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $project: { name: '$_id', value: '$count', _id: 0 } },
      ]),
      Faq.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $project: { name: '$_id', value: '$count', _id: 0 } },
      ]),
      Query.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $project: { name: '$_id', value: '$count', _id: 0 } },
      ]),
    ]);

    const totalQueries = queriesPending + queriesInProgress + queriesSolved;
    const totalSuggestions = suggestionsPending + suggestionsApproved + suggestionsRejected;

    const response = NextResponse.json(
      {
        counts: {
          faqs: faqsCount,
          users: usersCount,
          queries: {
            total: totalQueries,
            pending: queriesPending,
            inProgress: queriesInProgress,
            solved: queriesSolved,
          },
          suggestions: {
            total: totalSuggestions,
            pending: suggestionsPending,
            approved: suggestionsApproved,
            rejected: suggestionsRejected,
          },
        },
        charts: {
          queriesByCategory,
          faqsByCategory,
          queriesByPriority,
        },
      },
      { status: 200 }
    );

    // Cache for 30 seconds to avoid hammering DB on rapid navigation
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');

    return response;
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
