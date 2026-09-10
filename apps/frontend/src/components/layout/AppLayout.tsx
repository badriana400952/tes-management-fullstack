import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import {
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Plus,
  Menu,
  X,
  User,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAppDispatch } from '@/stores/store';
import { openCreateTaskModal } from '@/stores/uiSlice';

interface AppLayoutProps {
  title?: string;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  title = 'Dashboard',
  children,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    {
      name: 'Task Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: router.pathname === '/dashboard',
    },
  ];

  return (
    <>
      <Head>
        <title>{title} | TaskFlow</title>
      </Head>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white p-5 justify-between shadow-sm">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-2">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
                <CheckSquare className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Task<span className="text-indigo-600">Flow</span>
              </span>
            </div>

            {/* Quick Action */}
            <Button
              onClick={() => dispatch(openCreateTaskModal())}
              className="w-full justify-center"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Task
            </Button>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Actions */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                  {user?.role === 'ADMIN' && <Shield className="w-3 h-3 text-amber-500" />}
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 hover:border-rose-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-slate-900">
              Task<span className="text-indigo-600">Flow</span>
            </span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden p-4 bg-white border-b border-slate-200 space-y-3">
            <Button
              onClick={() => {
                setIsMobileMenuOpen(false);
                dispatch(openCreateTaskModal());
              }}
              className="w-full justify-center"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Task
            </Button>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
              <span>{user?.name}</span>
              <button onClick={logout} className="text-rose-600 font-medium">
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </>
  );
};
