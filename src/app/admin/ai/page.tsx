'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeVisionData } from '@/lib/ai-admin/vision-analyzer';

export default function AIAdminPage() {
  const router = useRouter();
  const [directory, setDirectory] = useState('');
  const [placeholderResults, setPlaceholderResults] = useState([]);

  useEffect(() => {
    if (directory) {
      analyzeVisionData(directory).then(results => setPlaceholderResults(results));
    }
  }, [directory]);

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <input
        type="text"
        value={directory}
        onChange={(e) => setDirectory(e.target.value)}
        placeholder="Enter directory to search..."
        className="bg-gray-800 text-white p-2 rounded"
      />
      <div>
        {placeholderResults.length > 0 ? (
          <ul>
            {placeholderResults.map((result, index) => (
              <li key={index} className="text-white">
                {result.path}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No placeholder data found.</p>
        )}
      </div>
    </div>
  );
}