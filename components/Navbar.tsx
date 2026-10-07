'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Sparkles, LayoutDashboard, LogOut } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isLinkActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav shadow-sm shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-slate-900 group shrink-0">
            <span className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </span>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-slate-950 bg-clip-text text-transparent">
              Yaksha Portal
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {[
              { path: '/', label: 'Home' },
              { path: '/faqs', label: 'Browse FAQs' },
              { path: '/raise-query', label: 'Raise Query' },
              { path: '/query-status', label: 'Track Query' },
              { path: '/suggest-faq', label: 'Suggest FAQ' },
            ].map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`relative px-3.5 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  isLinkActive(link.path)
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {isLinkActive(link.path) && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 bg-blue-50 border border-blue-100 rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Controls */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <Link
                  href={session.user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {session.user.role === 'admin' ? 'Admin Console' : 'My Dashboard'}
                </Link>

                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100/80 rounded-full border border-slate-200/50">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold font-sans">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                    {session.user.name}
                  </span>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-slate-700 hover:text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
