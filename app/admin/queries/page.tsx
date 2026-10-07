'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { useToast } from '../../../components/Providers';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox, Loader2, MessageSquare, X, Send, RefreshCw
} from 'lucide-react';

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

export default function AdminQueriesPage() {
  const { showToast } = useToast();
  const [queries, setQueries] = useState<Query[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Reply modal
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyingQuery, setReplyingQuery] = useState<Query | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQueries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/queries');
      if (res.ok) {
        const data = await res.json();
        setQueries(data);
      }
    } catch (err) {
      showToast('Failed to load support queries.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const openReplyModal = (q: Query) => {
    setReplyingQuery(q);
    setReplyText(q.adminReply || '');
    setIsReplyOpen(true);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !replyingQuery) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/queries/${replyingQuery._id}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: replyText.trim() }),
      });
      if (res.ok) {
        showToast('Reply sent successfully!', 'success');
        setIsReplyOpen(false);
        fetchQueries();
      } else {
        const data = await res.json();
        showToast(data.message || 'Reply failed.', 'error');
      }
    } catch (err) {
      showToast('An error occurred.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (queryId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/queries/${queryId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Status updated to "${newStatus}".`, 'success');
        fetchQueries();
      } else {
        const data = await res.json();
        showToast(data.message || 'Status update failed.', 'error');
      }
    } catch (err) {
      showToast('An error occurred.', 'error');
    }
  };

  const filtered = statusFilter === 'All'
    ? queries
    : queries.filter((q) => q.status === statusFilter);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Student Support Queries</h1>
            <p className="text-xs text-slate-500 mt-1">Review, reply, and update status of student inquiries.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 cursor-pointer focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Solved">Solved</option>
            </select>
            <button
              onClick={fetchQueries}
              disabled={isLoading}
              className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Query cards */}
        <div className="min-h-[300px]">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="text-xs font-semibold text-slate-400">Loading student inquiries...</span>
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((q) => (
                <div
                  key={q._id}
                  className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  {/* Top row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-slate-100 text-slate-500">
                        {q.category}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${
                        q.priority === 'High'
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : q.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {q.priority} Priority
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{q._id}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Status dropdown */}
                      <select
                        value={q.status}
                        onChange={(e) => handleStatusChange(q._id, e.target.value)}
                        className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border cursor-pointer focus:outline-none ${
                          q.status === 'Pending'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : q.status === 'In Progress'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Solved">Solved</option>
                      </select>

                      <button
                        onClick={() => openReplyModal(q)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {q.adminReply ? 'Edit Reply' : 'Reply'}
                      </button>
                    </div>
                  </div>

                  {/* Subject & message */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{q.subject}</h3>
                    <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                      {q.message}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 border-t border-slate-100 pt-3">
                    <span><strong className="text-slate-600">From:</strong> {q.name} ({q.email})</span>
                    <span><strong className="text-slate-600">Raised:</strong> {new Date(q.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  {/* Admin reply preview */}
                  {q.adminReply && (
                    <div className="p-4 bg-gradient-to-tr from-purple-50/50 to-indigo-50/30 rounded-xl border border-purple-100/50 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                        <span className="text-[10px] font-bold text-purple-700">Your Reply</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{q.adminReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center px-4 bg-white border border-slate-100 rounded-3xl">
              <Inbox className="w-10 h-10 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No queries match this filter</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xs">
                Try selecting a different status filter above.
              </p>
            </div>
          )}
        </div>

        {/* Reply Modal */}
        <AnimatePresence>
          {isReplyOpen && replyingQuery && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isSubmitting && setIsReplyOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative z-10 border border-slate-100"
              >
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <h3 className="font-bold text-sm">Reply to Inquiry</h3>
                  </div>
                  <button
                    onClick={() => setIsReplyOpen(false)}
                    disabled={isSubmitting}
                    className="p-1 hover:bg-white/10 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Student Inquiry</span>
                    <h4 className="text-xs font-bold text-slate-800">{replyingQuery.subject}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{replyingQuery.message}</p>
                    <span className="text-[9px] text-slate-400">By {replyingQuery.name} ({replyingQuery.email})</span>
                  </div>

                  <form onSubmit={handleReply} className="space-y-4">
                    <div>
                      <label htmlFor="reply" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                        Coordinator Response
                      </label>
                      <textarea
                        id="reply"
                        required
                        rows={5}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your official response here..."
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-colors resize-y leading-relaxed"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setIsReplyOpen(false)}
                        className="px-4 py-2 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !replyText.trim()}
                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Reply
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
