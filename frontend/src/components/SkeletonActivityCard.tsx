export function SkeletonActivityCard() {
  return (
    <div className="bg-white rounded-2xl border overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-200" />

      <div className="p-5 space-y-4">
        <div className="h-3 w-20 bg-gray-200 rounded" />
        <div className="h-5 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />

        <div className="pt-2 space-y-2">
          <div className="h-3 w-40 bg-gray-200 rounded" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}