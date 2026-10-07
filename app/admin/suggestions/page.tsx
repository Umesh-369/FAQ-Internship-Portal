'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { useToast } from '../../../components/Providers';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MessageSquarePlus, Loader2, CheckCircle2, XCircle,
  RefreshCw, X
} from 'lucide-react';

interface Suggestion {
  _id: string;
  userId: { _id: string; name: string; email: string } | null;
  question: string;
  suggestedAnswer: string;
  category: string;
  description?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminReview?: string;
  createdAt: string;
}

export default function AdminSuggestionsPage() {
  const { showToast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');

  // Review modal
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewingSuggestion, setReviewingSuggestion] = useState<Suggestion | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/faq-suggestions');
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch (err) {
      showToast('Failed to load FAQ suggestions.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const openReviewModal = (suggestion: Suggestion, action: 'approve' | 'reject') => {
    setReviewingSuggestion(suggestion);
    setReviewAction(action);
    setReviewNote('');
    setIsReviewOpen(true);
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSuggestion) return;

    if (reviewAction === 'reject' && !reviewNote.trim()) {
      showToast('Please provide a rejection reason.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = reviewAction === 'approve'
        ? `/api/faq-suggestions/${reviewingSuggestion._id}/approve`
        : `/api/faq-suggestions/${reviewingSuggestion._id}/reject`;

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReview: reviewNote.trim() || `${reviewAction === 'approve' ? 'Approved' : 'Rejected'} by administrator.` }),
      });

      if (res.ok) {
        showToast(
          reviewAction === 'approve'
            ? 'Suggestion approved and added to FAQ database!'
            : 'Suggestion rejected with review note.',
          'success'
        );
        setIsReviewOpen(false);
        fetchSuggestions();
      } else {
        const data = await res.json();
        showToast(data.message || 'Review failed.', 'error');
      }
    } catch (err) {
      showToast('An error occurred.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = suggestions.filter((s) => s.status === tabFilter);

  const tabCounts = {
    Pending: suggestions.filter((s) => s.status === 'Pending').length,
    Approved: suggestions.filter((s) => s.status === 'Approved').length,
    Rejected: suggestions.filter((s) => s.status === 'Rejected').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">FAQ Suggestions</h1>
            <p className="text-xs text-slate-500 mt-1">Review, approve, or reject intern-submitted FAQ recommendations.</p>
          </div>
          <button
            onClick={fetchSuggestions}
            disabled={isLoading}
            className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-0">
          {(['Pending', 'Approved', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setTabFilter(tab)}
              className={`relative px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                tabFilter === tab
                  ? 'text-purple-700'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {tabFilter === tab && (
                <motion.div
                  layoutId="suggestion-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-t-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {tab}
              <span className={`ml-1.5 px-1.5 py-0.5 text-[9px] rounded-full ${
                tabFilter === tab
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[300px]">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="text-xs font-semibold text-slate-400">Loading suggestions...</span>
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((s) => (
                <div
                  key={s._id}
                  className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-purple-50 text-purple-700 border border-purple-100">
                          {s.category}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${
                          s.status === 'Pending'
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : s.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">{s.question}</h3>
                    </div>

                    {s.status === 'Pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => openReviewModal(s, 'approve')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => openReviewModal(s, 'reject')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Suggested Answer</span>
                    <p className="text-xs text-slate-600 leading-relaxed">{s.suggestedAnswer}</p>
                  </div>

                  {s.description && (
                    <p className="text-[11px] text-slate-400 italic">Context: {s.description}</p>
                  )}

                  {s.adminReview && (
                    <div className="p-3 bg-gradient-to-tr from-purple-50/50 to-indigo-50/30 rounded-xl border border-purple-100/50 space-y-1">
                      <span className="text-[9px] font-bold text-purple-700 uppercase tracking-widest">Admin Review Note</span>
                      <p className="text-xs text-slate-600">{s.adminReview}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-[10px] text-slate-400 border-t border-slate-100 pt-3">
                    <span>
                      <strong className="text-slate-600">Submitted by:</strong>{' '}
                      {s.userId ? `${s.userId.name} (${s.userId.email})` : 'Unknown'}
                    </span>
                    <span>
                      <strong className="text-slate-600">Date:</strong>{' '}
                      {new Date(s.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center px-4 bg-white border border-slate-100 rounded-3xl">
              <MessageSquarePlus className="w-10 h-10 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No {tabFilter.toLowerCase()} suggestions</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xs">
                {tabFilter === 'Pending'
                  ? 'All suggestions have been reviewed. Check Approved or Rejected tabs.'
                  : `No suggestions with "${tabFilter}" status found.`}
              </p>
            </div>
          )}
        </div>

        {/* Review Modal */}
        <AnimatePresence>
          {isReviewOpen && reviewingSuggestion && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isSubmitting && setIsReviewOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative z-10 border border-slate-100"
              >
                <div className={`px-6 py-4 text-white flex items-center justify-between ${
                  reviewAction === 'approve'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                    : 'bg-gradient-to-r from-rose-600 to-pink-600'
                }`}>
                  <div className="flex items-center gap-2">
                    {reviewAction === 'approve' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <h3 className="font-bold text-sm">
                      {reviewAction === 'approve' ? 'Approve FAQ Suggestion' : 'Reject FAQ Suggestion'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsReviewOpen(false)}
                    disabled={isSubmitting}
                    className="p-1 hover:bg-white/10 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Proposed Question
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">{reviewingSuggestion.question}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{reviewingSuggestion.suggestedAnswer}</p>
                  </div>

                  {reviewAction === 'approve' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700">
                      <strong>Note:</strong> Approving will automatically create a new verified FAQ entry in the public database.
                    </div>
                  )}

                  <form onSubmit={handleReview} className="space-y-4">
                    <div>
                      <label htmlFor="review-note" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                        Review Note {reviewAction === 'reject' && <span className="text-rose-500">*</span>}
                      </label>
                      <textarea
                        id="review-note"
                        required={reviewAction === 'reject'}
                        rows={3}
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder={
                          reviewAction === 'approve'
                            ? 'Optional approval note...'
                            : 'Provide a reason for rejection (required)...'
                        }
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-colors resize-y leading-relaxed"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setIsReviewOpen(false)}
                        className="px-4 py-2 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-5 py-2.5 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-60 ${
                          reviewAction === 'approve'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            {reviewAction === 'approve' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            {reviewAction === 'approve' ? 'Approve & Publish' : 'Reject'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
