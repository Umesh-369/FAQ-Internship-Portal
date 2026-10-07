'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { useToast } from '../../components/Providers';
import { motion } from 'framer-motion';
import { Search, Loader2, Sparkles, AlertCircle, Clock, CheckCircle2, MessageSquare } from 'lucide-react';

interface Query {
  _id: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Solved';
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}

function StatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [queryId, setQueryId] = useState(searchParams.get('id') || '');
  const [query, setQuery] = useState<Query | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setQueryId(id);
      fetchQuery(id);
    }
  }, [searchParams]);

  const fetchQuery = async (id: string) => {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      showToast('Please enter a valid 24-character hexadecimal Query Ticket ID.', 'error');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setQuery(null);

    try {
      const res = await fetch(`/api/queries/${id}`);
      if (res.ok) {
        const data = await res.json();
        setQuery(data);
      } else {
        const data = await res.json();
        showToast(data.message || 'Ticket not found or access denied.', 'error');
      }
    } catch (err) {
      showToast('Failed to fetch ticket status.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryId.trim()) {
      showToast('Please enter a Query Ticket ID.', 'error');
      return;
    }
    // Update URL to match search and trigger useEffect
    router.push(`/query-status?id=${queryId.trim()}`);
  };

  return (
    <div className="flex-1 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-bold mb-3">
            <Clock className="w-3.5 h-3.5" />
            Ticket Tracker
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Track Support Query
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Input your 24-character Query Ticket ID to monitor real-time review updates.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-10">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
              placeholder="Enter Ticket ID (e.g. 64c39dae4c25f...)"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-sm font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-98 cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </form>

        {/* Results */}
        <div className="min-h-[200px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-xs font-semibold">Retrieving ticket history...</span>
            </div>
          )}

          {!isLoading && query && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Dynamic Status Timeline */}
              <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/40 shadow-xl bg-white/70 backdrop-blur-md">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6">
                  Review Timeline Status
                </h2>

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-4 pb-4">
                  {/* Timeline bar (Desktop) */}
                  <div className="absolute top-[20px] left-[20px] right-[20px] h-0.5 bg-slate-200 hidden sm:block -z-10" />

                  {/* Step 1: Submitted */}
                  <div className="flex sm:flex-col items-center gap-3 sm:text-center flex-1 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-md ${
                      query.status === 'Pending' || query.status === 'In Progress' || query.status === 'Solved'
                        ? 'bg-blue-600 shadow-blue-500/10'
                        : 'bg-slate-300'
                    }`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">1. Inquiry Submitted</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(query.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Under Review */}
                  <div className="flex sm:flex-col items-center gap-3 sm:text-center flex-1 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-md ${
                      query.status === 'In Progress' || query.status === 'Solved'
                        ? 'bg-indigo-600 shadow-indigo-500/10 animate-pulse'
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${query.status === 'In Progress' || query.status === 'Solved' ? 'text-slate-800' : 'text-slate-400'}`}>
                        2. Under Review
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {query.status === 'In Progress' || query.status === 'Solved' ? 'In progress' : 'Waiting...'}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Solved */}
                  <div className="flex sm:flex-col items-center gap-3 sm:text-center flex-1 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-md ${
                      query.status === 'Solved'
                        ? 'bg-emerald-600 shadow-emerald-500/10'
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${query.status === 'Solved' ? 'text-slate-800' : 'text-slate-400'}`}>
                        3. Solved & Replied
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {query.status === 'Solved' ? 'Resolution added' : 'Waiting...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/40 shadow-xl bg-white/70 backdrop-blur-md space-y-5">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-slate-100 text-slate-500 mr-2">
                      {query.priority} Priority
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{query._id}</span>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                    query.status === 'Pending'
                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                      : query.status === 'In Progress'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  }`}>
                    {query.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Category / Subject
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    [{query.category}] {query.subject}
                  </h3>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Your Message
                  </span>
                  <p className="text-xs text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                    {query.message}
                  </p>
                </div>

                {/* Coordinator Response Panel */}
                {query.adminReply ? (
                  <div className="p-5 sm:p-6 bg-gradient-to-tr from-blue-50/50 to-indigo-50/30 rounded-2xl border border-blue-100/50 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Official Coordinator Reply</h4>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          Answered on {new Date(query.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-1">
                      {query.adminReply}
                    </p>
                  </div>
                ) : (
                  <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl flex items-start gap-3">
                    <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Awaiting Coordinator Assignment</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Coordinators are reviewing your details. When a reply is drafted, your status will update to <span className="font-bold text-emerald-600">Solved</span> and you will receive a notification.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {!isLoading && hasSearched && !query && (
            <div className="text-center py-16 px-4 bg-white border border-slate-100 rounded-3xl">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Inquiry Ticket Not Found</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Check that the Ticket ID is exactly a 24-character hex ID (e.g. 64c39dae...). Student queries can only be accessed under the registered student account session.
              </p>
            </div>
          )}

          {!hasSearched && (
            <div className="text-center py-16 px-4 bg-white/40 border border-dashed border-slate-200 rounded-3xl">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Awaiting Search
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Provide a Support Ticket ID from your dashboard or click the track link in your confirmation page.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function QueryStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-xs font-semibold text-slate-400">Loading Ticket Tracker...</span>
      </div>
    }>
      <StatusContent />
    </Suspense>
  );
}
