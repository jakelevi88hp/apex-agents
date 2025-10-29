import { useRouter } from 'next/router';
import React from 'react';
import Button from '../../components/Button';

export default function AiAdminPage() {
  const router = useRouter();

  const navigateToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div>
      <Button onClick={navigateToDashboard}>Back to Dashboard</Button>
      {/* Rest of your AiAdminPage component */}
    </div>
  );
}
