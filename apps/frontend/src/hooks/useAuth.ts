import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import {
  loginUser,
  registerUser,
  logoutUser,
  checkAuthSession,
  clearError,
} from '@/stores/authSlice';
import { LoginPayload, RegisterPayload } from '@/types/user.types';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, isInitialized, error } = useAppSelector(
    (state) => state.auth
  );

  // Initialize session on client mount
  useEffect(() => {
    if (!isInitialized) {
      dispatch(checkAuthSession());
    }
  }, [dispatch, isInitialized]);

  const login = async (credentials: LoginPayload) => {
    const result = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.name}!`);
      router.push('/dashboard');
      return result.payload;
    } else {
      const msg = (result.payload as string) || 'Login failed';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const register = async (payload: RegisterPayload) => {
    const result = await dispatch(registerUser(payload));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Registration successful! Welcome aboard.');
      router.push('/dashboard');
      return result.payload;
    } else {
      const msg = (result.payload as string) || 'Registration failed';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    login,
    register,
    logout,
    clearAuthError: () => dispatch(clearError()),
  };
};
