import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isInitialized, isAuthenticated, router]);

  return (
    <AuthLayout
      title="Sign In to TaskFlow"
      subtitle="Enter your credentials to access your task dashboard"
    >
      <LoginForm />
    </AuthLayout>
  );
}
