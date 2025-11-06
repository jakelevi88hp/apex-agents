export default function AgentCardSkeleton() {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-2 border-gray-700 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-gray-700 w-14 h-14" />
        <div className="flex items-center gap-2">
          <div className="w-16 h-6 bg-gray-700 rounded" />
        </div>
      </div>
      
      <div className="h-6 bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-700 rounded w-full mb-1" />
      <div className="h-4 bg-gray-700 rounded w-5/6 mb-4" />
      
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-700 rounded w-20" />
        <div className="h-6 bg-gray-700 rounded w-24" />
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-gray-700 rounded" />
        <div className="h-10 w-10 bg-gray-700 rounded" />
      </div>
    </div>
  );
}
