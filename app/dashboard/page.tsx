'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { useToast } from '../../components/Providers';
import { 
  PlusCircle, Loader2, AlertCircle, Clock, CheckCircle2, 
  ArrowRight, Inbox, RefreshCw, HelpCircle, FileText
} from 'lucide-react';

interface Query {
  _id: string;
  category: string;
  subject: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Solved';
  createdAt: string;
  adminReply?: string;
}

interface Suggestion {
  _id: string;
  question: string;
  category: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  adminReview?: string;
}

export default function StudentDashboardPage() {
  const { data: session, status } = useSession();
  const { showToast } = useToast();

  const [queries, setQueries] = useState<Query[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch queries and suggestions in parallel
      const [qRes, sRes] = await Promise.all([
        fetch('/api/queries'),
        fetch('/api/faq-suggestions'),
      ]);

      const [qData, sData] = await Promise.all([
        qRes.ok ? qRes.json() : [],
        sRes.ok ? sRes.json() : [],
      ]);

      setQueries(qData);
      setSuggestions(sData);
    } catch (err) {
      showToast('Failed to load dashboard summaries.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-xs font-semibold text-slate-400">Loading Student Dashboard...</span>
      </div>
    );
  }

  // Calculate quick metrics
  const totalQueries = queries.length;
  const solvedQueries = queries.filter((q) => q.status === 'Solved').length;
  const pendingQueries = queries.filter((q) => q.status === 'Pending').length;
  const totalSuggestions = suggestions.length;

  return (
    <div className="flex-1 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/10 rounded-full blur-[60px]" />
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {session?.user?.name || 'Intern'}!
            </h1>
            <p className="mt-2 text-sm text-blue-100 max-w-lg leading-relaxed">
              Welcome to your Vicharanashala Support Dashboard. Here you can submit support inquiries, review coordinator feedback, and contribute to our program knowledge base.
            </p>
          </div>

          <div className="shrink-0 flex gap-3 relative z-10">
            <Link
              href="/raise-query"
              className="inline-flex items-center gap-1.5 px-5 py-3 bg-white hover:bg-slate-50 text-blue-600 font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              <Inbox className="w-4 h-4" />
              Raise Query
            </Link>
            <Link
              href="/suggest-faq"
              className="inline-flex items-center gap-1.5 px-5 py-3 bg-blue-700/50 hover:bg-blue-700/80 text-white font-bold text-xs rounded-xl border border-blue-500/30 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Suggest FAQ
            </Link>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Total Queries', value: totalQueries, icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-100' },
            { label: 'Solved Tickets', value: solvedQueries, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
            { label: 'Pending Response', value: pendingQueries, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
            { label: 'FAQ Suggestions', value: totalSuggestions, icon: HelpCircle, color: 'text-purple-600 bg-purple-50 border-purple-100' },
          ].map((card, i) => (
            <div key={i} className="glass-card p-5 rounded-2xl border border-white/40 shadow-md bg-white/70 backdrop-blur-md flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {card.label}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1 block">
                  {isLoading ? '...' : card.value}
                </span>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Support Tickets */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Inbox className="w-5 h-5 text-blue-600" />
                Active Support Tickets
              </h2>
              <button
                onClick={fetchDashboardData}
                disabled={isLoading}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3 bg-white border border-slate-100 rounded-3xl">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-xs font-semibold">Loading inquiries...</span>
              </div>
            ) : queries.length > 0 ? (
              <div className="space-y-3">
                {queries.map((q) => (
                  <div
                    key={q._id}
                    className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-slate-100 text-slate-500">
                          {q.category}
                        </span>
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                          q.priority === 'Low'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : q.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {q.priority}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 max-w-md truncate">
                        {q.subject}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        Raised on {new Date(q.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                        q.status === 'Pending'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : q.status === 'In Progress'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {q.status}
                      </span>
                      <Link
                        href={`/query-status?id=${q._id}`}
                        className="inline-flex items-center justify-center p-2 hover:bg-slate-50 text-slate-400 hover:text-blue-600 border border-slate-100 hover:border-blue-100 rounded-xl transition-all cursor-pointer"
                        title="Track Status"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-white border border-slate-100 rounded-3xl shadow-sm">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No raised queries found</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  You haven't raised any support queries yet. Click the "Raise Query" button above if you have novel internship questions.
                </p>
              </div>
            )}
          </div>

          {/* FAQ Suggestions */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-purple-600" />
              My FAQ Suggestions
            </h2>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3 bg-white border border-slate-100 rounded-3xl">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <span className="text-xs font-semibold">Loading recommendations...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-3">
                {suggestions.map((s) => (
                  <div
                    key={s._id}
                    className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-slate-100 text-slate-500">
                          {s.category}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          s.status === 'Pending'
                            ? 'bg-blue-50 text-blue-700'
                            : s.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mt-2 line-clamp-2 leading-snug">
                        {s.question}
                      </h4>
                    </div>

                    {s.adminReview && (
                      <div className="text-[10px] bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-500 leading-normal">
                        <span className="font-bold text-slate-700 block mb-0.5">Admin Review:</span>
                        {s.adminReview}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-white border border-slate-100 rounded-3xl shadow-sm">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No suggestions submitted</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Help improve Vicharanashala policies by submitting custom recommendations.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
