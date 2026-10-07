'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { useToast } from '../../components/Providers';
import { motion } from 'framer-motion';
import { PlusCircle, Loader2, Send } from 'lucide-react';

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
];

export default function SuggestFaqPage() {
  const { status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [question, setQuestion] = useState('');
  const [suggestedAnswer, setSuggestedAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question || !suggestedAnswer || !category) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/faq-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          suggestedAnswer: suggestedAnswer.trim(),
          category,
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('FAQ suggestion submitted successfully for moderation!', 'success');
        setQuestion('');
        setSuggestedAnswer('');
        setCategory('');
        setDescription('');
        router.push('/dashboard');
      } else {
        showToast(data.message || 'Failed to submit suggestion.', 'error');
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
        <span className="text-xs font-semibold text-slate-400">Loading Suggestion Panel...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-purple-700 text-xs font-bold mb-3">
            <PlusCircle className="w-3.5 h-3.5" />
            Suggest FAQ
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Recommend a Program FAQ
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Spotted a recurring query that is not addressed? Suggest it here. Approved recommendations are integrated globally.
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
                <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  FAQ Category
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
                <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Context / Description (Optional)
                </label>
                <input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why is this FAQ important?"
                  className="w-full px-4 py-2.5 bg-white/60 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="question" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Proposed FAQ Question
              </label>
              <input
                id="question"
                type="text"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What is the question that interns frequently ask?"
                className="w-full px-4 py-2.5 bg-white/60 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="suggestedAnswer" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Suggested verified answer
              </label>
              <textarea
                id="suggestedAnswer"
                required
                rows={5}
                value={suggestedAnswer}
                onChange={(e) => setSuggestedAnswer(e.target.value)}
                placeholder="Provide a clear, detailed, and verified response to this question..."
                className="w-full px-4 py-2.5 bg-white/60 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-sm resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-purple-600/10 hover:shadow-purple-600/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Submit Recommendation
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
