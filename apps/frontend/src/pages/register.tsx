import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isInitialized, isAuthenticated, router]);

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Sign up in seconds to start organizing your work efficiently"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
