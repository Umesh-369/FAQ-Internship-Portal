'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { useToast } from '../../components/Providers';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2, Send, Check } from 'lucide-react';

const CATEGORIES = [
  'About the Internship',
  'Timing and Dates',
  'NOC',
  'Selection & Offer Letter',
  'Work & Mentorship',
  'Code of Conduct',
  'Certificate',
  'Rosetta Journal',
  'Phase 1 & ViBe Platform',
  'Team Formation',
  'Yaksha Chat',
  'Interviews',
  'Other',
];

const PRIORITIES: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];

export default function RaiseQueryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill user data when session loads
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !category || !subject || !message) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          category,
          subject: subject.trim(),
          message: message.trim(),
          priority,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Support query raised successfully!', 'success');
        // Clear fields that are not session-bound
        setSubject('');
        setMessage('');
        setCategory('');
        setPriority('Medium');
        // Redirect to status tracker or dashboard
        router.push(`/query-status?id=${data._id}`);
      } else {
        showToast(data.message || 'Failed to raise query.', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-xs font-semibold text-slate-400">Loading Inquiry Center...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold mb-3">
            <AlertCircle className="w-3.5 h-3.5" />
            Support Tickets
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Submit a support query
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Get personalized assistance from Vicharanashala coordinators for your specific query.
          </p>
        </div>

        {/* Card Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 sm:p-8 rounded-2xl border border-white/40 shadow-xl bg-white/70 backdrop-blur-md"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  disabled
                  value={name}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-sm cursor-not-allowed outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  disabled
                  value={email}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-sm cursor-not-allowed outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Inquiry Category
                </label>
                <select
                  id="category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm text-slate-800 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="" disabled>Select category...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Priority Urgency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRIORITIES.map((p) => {
                    const isActive = priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isActive
                            ? p === 'Low'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm shadow-emerald-500/5'
                              : p === 'Medium'
                              ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-sm shadow-amber-500/5'
                              : 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm shadow-rose-500/5'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {isActive && <Check className="w-3.5 h-3.5" />}
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Subject Headline
              </label>
              <input
                id="subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your question..."
                className="w-full px-4 py-2.5 bg-white/60 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Detailed Inquiry Description
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide as much details as possible. E.g. date changes, HOD email signature forwarding details, Rosetta logs, etc."
                className="w-full px-4 py-2.5 bg-white/60 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-sm resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Submit Inquiry Ticket
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
