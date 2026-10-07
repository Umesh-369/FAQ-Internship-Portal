'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { useToast } from '../../../components/Providers';
import { 
  BarChart as RechartBarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  ResponsiveContainer, PieChart as RechartPieChart, Pie, Cell, CartesianGrid 
} from 'recharts';
import { 
  Users, Inbox, HelpCircle, Loader2, Sparkles, AlertCircle 
} from 'lucide-react';

interface Stats {
  counts: {
    faqs: number;
    users: number;
    queries: {
      total: number;
      pending: number;
      inProgress: number;
      solved: number;
    };
    suggestions: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
  };
  charts: {
    queriesByCategory: { name: string; value: number }[];
    faqsByCategory: { name: string; value: number }[];
    queriesByPriority: { name: string; value: number }[];
  };
}

const COLORS = ['#2563EB', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#6366F1', '#8B5CF6', '#EC4899'];

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          showToast('Failed to load portal statistics.', 'error');
        }
      } catch (err) {
        console.error('Failed fetching admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <AdminLayout>
        <div className="h-96 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="text-xs font-semibold text-slate-400">Compiling support metrics...</span>
        </div>
      </AdminLayout>
    );
  }

  const { counts, charts } = stats;

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Portal Overview Stats</h1>
            <p className="text-xs text-slate-500 mt-1">Real-time metrics, FAQ categorizations, and ticket priority aggregates.</p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-purple-700 text-xs font-bold shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            Live Analytics
          </div>
        </div>

        {/* Counts summary grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Seeded FAQs', value: counts.faqs, icon: HelpCircle, bg: 'bg-blue-50 text-blue-600 border-blue-100' },
            { label: 'Registered Users', value: counts.users, icon: Users, bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
            { label: 'Active Support Tickets', value: counts.queries.total, desc: `${counts.queries.pending} pending`, icon: Inbox, bg: 'bg-pink-50 text-pink-600 border-pink-100' },
            { label: 'FAQ Suggestions', value: counts.suggestions.total, desc: `${counts.suggestions.pending} pending`, icon: AlertCircle, bg: 'bg-purple-50 text-purple-600 border-purple-100' },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-slate-150 p-6 rounded-2xl flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{item.label}</span>
                <span className="text-3xl font-black text-slate-800 block leading-none">{item.value}</span>
                {item.desc && <span className="text-[10px] font-medium text-slate-500">{item.desc}</span>}
              </div>
              <div className={`w-11 h-11 border rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                <item.icon className="w-5.5 h-5.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        {isMounted && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Queries by category */}
            <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm flex flex-col h-[400px]">
              <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Inbox className="w-4 h-4 text-purple-600" />
                Support Tickets by Category
              </h3>
              <div className="flex-1 min-h-0">
                {charts.queriesByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartPieChart>
                      <Pie
                        data={charts.queriesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {charts.queriesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} queries`, 'Inquiries']} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    </RechartPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs font-semibold text-slate-400">
                    Awaiting query logs...
                  </div>
                )}
              </div>
            </div>

            {/* FAQs by category */}
            <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm flex flex-col h-[400px]">
              <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                Database FAQs by Category
              </h3>
              <div className="flex-1 min-h-0">
                {charts.faqsByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartBarChart data={charts.faqsByCategory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value) => [`${value} FAQs`, 'FAQ count']} />
                      <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]}>
                        {charts.faqsByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </RechartBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs font-semibold text-slate-400">
                    No FAQs available.
                  </div>
                )}
              </div>
            </div>

            {/* Queries by priority */}
            <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm flex flex-col h-[350px] lg:col-span-2">
              <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-pink-600" />
                Support Query Severity Priority Breakdowns
              </h3>
              <div className="flex-1 min-h-0">
                {charts.queriesByPriority.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartBarChart data={charts.queriesByPriority} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value) => [`${value} tickets`, 'Inquiries']} />
                      <Bar dataKey="value" fill="#7C3AED" radius={[0, 4, 4, 0]}>
                        {charts.queriesByPriority.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.name === 'High' 
                                ? '#EF4444' 
                                : entry.name === 'Medium' 
                                ? '#F59E0B' 
                                : '#10B981'
                            } 
                          />
                        ))}
                      </Bar>
                    </RechartBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs font-semibold text-slate-400">
                    No inquiries registered.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
