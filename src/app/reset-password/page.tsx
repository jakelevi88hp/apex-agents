'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const invalidLinkMessage = 'Invalid reset link. Please request a new password reset.';
  // Surface token issues without needing an immediate state change inside an effect.
  const derivedError = !token ? invalidLinkMessage : error;

  const resetMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setError('');
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    },
    onError: (error) => {
      setError(error.message || 'Failed to reset password');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    resetMutation.mutate({
      token,
      newPassword: formData.newPassword,
    });
  };

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

        {derivedError && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {derivedError}
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
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
