import React, { useState } from 'react';
import { Loading } from '@/components/ui/loading';

export default function AGIChatPage() {
  const [loading, setLoading] = useState(false);

  const handleChatRequest = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className='p-4'>
      {loading ? (
        <Loading text='Processing...' fullScreen={true} />
      ) : (
        <button onClick={handleChatRequest} className='btn btn-primary'>Start Chat</button>
      )}
    </div>
  );
}
