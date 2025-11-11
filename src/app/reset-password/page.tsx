import ResetPasswordForm from './ResetPasswordForm';

interface ResetPasswordPageProps {
  searchParams: {
    token?: string;
  };
}

/**
 * Reset password page renders the reset form while keeping the route on the server.
 */
export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const token = searchParams?.token ?? null;

  return <ResetPasswordForm token={token} />;
}
