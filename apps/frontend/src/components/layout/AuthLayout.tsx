import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CheckSquare } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <>
      <Head>
        <title>{title} | TaskFlow</title>
      </Head>
      <div className="flex min-h-screen flex-col justify-center items-center px-4 py-12 bg-slate-50 text-slate-800">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
              <CheckSquare className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Task<span className="text-indigo-600">Flow</span>
            </span>
          </Link>
          <h2 className="mt-4 text-xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>

        {/* Card Container */}
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          {children}
        </div>
      </div>
    </>
  );
};
