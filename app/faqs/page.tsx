'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, HelpCircle, ChevronDown, Sparkles, Loader2, BookOpen } from 'lucide-react';

interface Faq {
  _id: string;
  question: string;
  answer: string;
  category: string;
}

const CATEGORIES = [
  'All',
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

function FaqContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Load selected category from query params when they change
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && CATEGORIES.includes(cat)) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Fetch FAQs from API
  useEffect(() => {
    const fetchFaqs = async () => {
      setIsLoading(true);
      try {
        let url = `/api/faqs?`;
        if (selectedCategory && selectedCategory !== 'All') {
          url += `category=${encodeURIComponent(selectedCategory)}&`;
        }
        if (searchQuery.trim()) {
          url += `search=${encodeURIComponent(searchQuery.trim())}&`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setFaqs(data);
        }
      } catch (err) {
        console.error('Failed to load FAQs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search input
    const delayDebounce = setTimeout(() => {
      fetchFaqs();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [selectedCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  return (
    <div className="flex-1 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-bold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Knowledge Base
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Everything you need to know about Vicharanashala Summer Internship 2026.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-8">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs by keywords (e.g. NOC, certificate, VINS)..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-sm"
          />
        </div>

        {/* Category Navigation Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 pb-2 overflow-x-auto max-w-full">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setExpandedFaqId(null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all border cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQs List */}
        <div className="space-y-4 min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-xs font-semibold">Searching knowledge base...</span>
            </div>
          ) : faqs.length > 0 ? (
            <div className="space-y-3">
              {faqs.map((faq) => {
                const isExpanded = expandedFaqId === faq._id;
                return (
                  <div
                    key={faq._id}
                    className="rounded-2xl border border-slate-100 bg-white hover:border-slate-200/80 hover:shadow-sm overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => toggleExpand(faq._id)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer"
                    >
                      <div className="flex items-start gap-3.5 pr-4">
                        <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                          <HelpCircle className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            {faq.category}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                            {faq.question}
                          </h3>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180 text-blue-600' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                          <div className="px-6 pb-6 pt-1 border-t border-slate-50 text-xs sm:text-sm text-slate-500 leading-relaxed font-sans pl-[58px]">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 px-4 glass-card border border-slate-100 rounded-3xl bg-white">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-800">No matching FAQs found</h3>
              <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                We couldn't find any policy matches for "{searchQuery}". Try searching other keywords or use the floating Yaksha Chatbot on the bottom right.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function FaqsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-xs font-semibold text-slate-400">Loading FAQ Center...</span>
      </div>
    }>
      <FaqContent />
    </Suspense>
  );
}
