'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  PieChart, HelpCircle, Inbox, Users, LogOut, Home, 
  ShieldAlert, Sparkles, Loader2, MessageSquarePlus 
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // If loading session, show animated skeleton
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="text-xs font-semibold text-slate-400">Securing Admin Session...</span>
      </div>
    );
  }

  // Double check role
  if (!session || session.user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center font-sans">
        <ShieldAlert className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
        <h1 className="text-xl font-bold text-slate-800">Admin Authentication Required</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">
          This workspace is restricted to coordinators. Please log in with an administrator account.
        </p>
        <Link
          href="/admin/login"
          className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-purple-500/10 cursor-pointer"
        >
          Go to Admin Login
        </Link>
      </div>
    );
  }

  const isLinkActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-800">
      {/* Sidebar Panel */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        {/* Brand */}
        <div className="h-16 px-6 border-b border-slate-150 flex items-center gap-2.5 shrink-0 bg-slate-50/50">
          <span className="p-1.5 bg-purple-600 text-white rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-extrabold text-sm tracking-wide text-slate-900 leading-none">Yaksha Console</h2>
            <span className="text-[9px] font-bold text-purple-600 uppercase tracking-widest block mt-1">Moderator Area</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {[
            { path: '/admin/dashboard', label: 'Overview Stats', icon: PieChart },
            { path: '/admin/faqs', label: 'Manage FAQs', icon: HelpCircle },
            { path: '/admin/queries', label: 'Student Queries', icon: Inbox },
            { path: '/admin/suggestions', label: 'FAQ Suggestions', icon: MessageSquarePlus },
            { path: '/admin/users', label: 'Intern Accounts', icon: Users },
          ].map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`relative flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                isLinkActive(item.path)
                  ? 'text-purple-700 font-extrabold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {isLinkActive(item.path) && (
                <motion.div
                  layoutId="admin-active-nav"
                  className="absolute inset-0 bg-purple-50 border border-purple-100 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon className={`w-4 h-4 ${isLinkActive(item.path) ? 'text-purple-600' : 'text-slate-400'}`} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200/50 rounded-lg transition-all cursor-pointer"
          >
            <Home className="w-4 h-4 text-slate-400" />
            Back to Portal
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent rounded-lg transition-all cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4" />
            Logout Command
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden min-w-0">
        {/* Header */}
        <header className="h-16 px-8 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-semibold text-slate-500">VINS-2026 Admin Portal</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">
              Welcome, {session.user.name}
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold font-sans">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 overflow-y-auto min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
