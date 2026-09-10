import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';
import { CheckSquare, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  return (
    <>
      <Head>
        <title>TaskFlow | Modern Task Management</title>
        <meta
          name="description"
          content="Modern, clean task management system."
        />
      </Head>

      <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
        {/* Navigation */}
        <header className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Task<span className="text-indigo-600">Flow</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isInitialized && isAuthenticated ? (
              <Button
                onClick={() => router.push('/dashboard')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Button onClick={() => router.push('/register')}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-4xl mx-auto px-6 py-20 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            Task Management System
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Manage your daily tasks with{' '}
            <span className="text-indigo-600">
              clarity & simplicity
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A clean, intuitive workspace to organize, prioritize, and complete your tasks with full real-time updates and seamless security.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => router.push(isAuthenticated ? '/dashboard' : '/register')}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="w-full sm:w-auto px-8 shadow-md"
            >
              {isAuthenticated ? 'Open Dashboard' : 'Start for Free'}
            </Button>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors text-center"
            >
              Sign In Existing Account
            </Link>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <Zap className="w-6 h-6 text-indigo-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-900">Real-time Updates</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Optimistic UI updates powered by SWR and Redux Toolkit state transitions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <ShieldCheck className="w-6 h-6 text-emerald-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-900">Secure Access</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Automated silent JWT token rotation using secure HTTP-only cookies.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <CheckSquare className="w-6 h-6 text-indigo-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-900">Smart Filtering</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Search, debounced filters, status tabs, and priority sorting.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-slate-50">
          TaskFlow © {new Date().getFullYear()} — Fullstack Task Management
        </footer>
      </div>
    </>
  );
}
