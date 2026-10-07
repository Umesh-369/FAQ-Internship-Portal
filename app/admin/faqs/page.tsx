'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { useToast } from '../../../components/Providers';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, Search, X, Loader2, Sparkles, AlertTriangle, 
  HelpCircle 
} from 'lucide-react';

interface Faq {
  _id: string;
  question: string;
  answer: string;
  category: string;
  createdAt: string;
}

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

export default function AdminFaqPage() {
  const { showToast } = useToast();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);

  // Form states
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingFaq, setDeletingFaq] = useState<Faq | null>(null);

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
      showToast('Failed to load FAQs repository.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFaqs();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [selectedCategory, searchQuery]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingFaq(null);
    setQuestion('');
    setAnswer('');
    setCategory(CATEGORIES[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (faq: Faq) => {
    setModalMode('edit');
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category);
    setIsModalOpen(true);
  };

  const openDeleteModal = (faq: Faq) => {
    setDeletingFaq(faq);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim() || !category) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let res;
      if (modalMode === 'create') {
        res = await fetch('/api/faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, answer, category }),
        });
      } else {
        res = await fetch(`/api/faqs/${editingFaq?._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, answer, category }),
        });
      }

      if (res.ok) {
        showToast(
          modalMode === 'create' 
            ? 'FAQ created successfully!' 
            : 'FAQ updated successfully!', 
          'success'
        );
        setIsModalOpen(false);
        fetchFaqs();
      } else {
        const data = await res.json();
        showToast(data.message || 'Operation failed.', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingFaq) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/faqs/${deletingFaq._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast('FAQ deleted successfully.', 'success');
        setIsDeleteOpen(false);
        fetchFaqs();
      } else {
        const data = await res.json();
        showToast(data.message || 'Deletion failed.', 'error');
      }
    } catch (err) {
      showToast('An error occurred during deletion.', 'error');
    } finally {
      setIsSubmitting(false);
      setDeletingFaq(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Manage Program FAQs</h1>
            <p className="text-xs text-slate-500 mt-1">Add, update, or remove knowledge base policies dynamically.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-purple-500/10 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create New FAQ
          </button>
        </div>

        {/* Search & Filters bar */}
        <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs by question keywords..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 rounded-xl text-xs text-slate-800 focus:outline-none transition-all"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 rounded-xl text-xs text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Content list */}
        <div className="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden min-h-[300px]">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="text-xs font-semibold text-slate-400">Loading program FAQs...</span>
            </div>
          ) : faqs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-150">
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 w-[40%]">Question</th>
                    <th className="px-6 py-4 w-[40%]">Answer Preview</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {faqs.map((faq) => (
                    <tr key={faq._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 text-[9px] font-bold bg-purple-50 border border-purple-100 text-purple-700 rounded-md">
                          {faq.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 leading-snug">
                        {faq.question}
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate leading-normal">
                        {faq.answer}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(faq)}
                            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-purple-600 rounded-xl transition-all cursor-pointer"
                            title="Edit FAQ"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(faq)}
                            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                            title="Delete FAQ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center px-4">
              <HelpCircle className="w-10 h-10 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No matching FAQs found</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xs">
                No FAQs match your current filters. Clear your search or add a new FAQ above.
              </p>
            </div>
          )}
        </div>

        {/* MODAL: Create / Edit FAQ */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />

              {/* Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden relative z-10 border border-slate-100"
              >
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <h3 className="font-bold text-sm">
                      {modalMode === 'create' ? 'Create New Program FAQ' : 'Edit Program FAQ'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label htmlFor="modal-category" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      FAQ Category
                    </label>
                    <select
                      id="modal-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl text-xs text-slate-800 focus:outline-none cursor-pointer transition-colors"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="modal-question" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Question
                    </label>
                    <input
                      id="modal-question"
                      type="text"
                      required
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Input FAQ question..."
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="modal-answer" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Answer Response
                    </label>
                    <textarea
                      id="modal-answer"
                      required
                      rows={6}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Input detailed official policy response..."
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-colors resize-y font-sans leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-purple-500/10 active:scale-98 transition-all"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {modalMode === 'create' && <Plus className="w-4 h-4" />}
                          {modalMode === 'create' ? 'Create' : 'Save Changes'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: Delete FAQ */}
        <AnimatePresence>
          {isDeleteOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isSubmitting && setIsDeleteOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative z-10 p-6 border border-slate-100 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-xl shrink-0 border border-rose-100">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Delete Program FAQ?</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Are you sure you want to delete this FAQ? This action is immediate and will remove it from the student repository and search chatbot indices.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700 italic">
                  "{deletingFaq?.question}"
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsDeleteOpen(false)}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleDelete}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Confirm Delete
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
