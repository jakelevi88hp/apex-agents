'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';

interface ResetPasswordFormProps {
  token: string | null;
}

interface ResetFormData {
  newPassword: string;
  confirmPassword: string;
}

/**
 * ResetPasswordForm handles password reset submission and redirects users after success.
 */
export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ResetFormData>({
    newPassword: '',
    confirmPassword: '',
  });
  const invalidLinkMessage = 'Invalid reset link. Please request a new password reset.';
  const [formError, setFormError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const resetMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setFormError('');
    },
    onError: (mutationError) => {
      setFormError(mutationError.message || 'Failed to reset password');
    },
  });

  useEffect(() => {
    if (!success) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      router.push('/login');
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [router, success]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError('');

      if (formData.newPassword !== formData.confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }

      if (formData.newPassword.length < 8) {
        setFormError('Password must be at least 8 characters');
        return;
      }

      if (!token) {
        setFormError('Invalid reset token');
        return;
      }

      resetMutation.mutate({
        token,
        newPassword: formData.newPassword,
      });
    },
    [formData, resetMutation, token],
  );

  const handleFieldChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = event.target;
      const field = id as keyof ResetFormData;
      setFormData((previous) => ({
        ...previous,
        [field]: value,
      }));
    },
    [],
  );

  const displayError = !token ? invalidLinkMessage : formError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-gray-300">Enter your new password</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200">
            Password reset successfully! Redirecting to login...
          </div>
        )}

        {displayError && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {displayError}
          </div>
        )}

        {!success && token && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-200 mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                required
                value={formData.newPassword}
                onChange={handleFieldChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
                minLength={8}
              />
              <p className="mt-1 text-xs text-gray-400">Must be at least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleFieldChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={resetMutation.isPending}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetMutation.isPending ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {!token && (
          <div className="text-center">
            <Link
              href="/forgot-password"
              className="inline-block py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              Request New Reset Link
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-purple-400 hover:text-purple-300">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
