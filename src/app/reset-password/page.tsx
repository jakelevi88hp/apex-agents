import ResetPasswordForm from './reset-password-form';

/**
 * Props for the reset password page.
 */
interface ResetPasswordPageProps {
  searchParams?: {
    token?: string | string[];
  };
}

/**
 * Server wrapper that passes the reset token to the client form.
 * @param searchParams - Query string parameters containing the reset token.
 * @returns The reset password page content.
 */
export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const token = typeof searchParams?.token === 'string' ? searchParams.token : null;

  return <ResetPasswordForm token={token} />;
}
