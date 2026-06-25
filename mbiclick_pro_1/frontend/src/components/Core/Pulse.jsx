export default function Pulse() {
  return (
    <div className="border border-blue-300 shadow rounded-md p-4 w-full mx-auto">
      <div className="animate-pulse grid grid-cols-1 gap-4">
        {/* Profile Circle */}
        {/* <div className="flex items-center space-x-4">
          <div className="rounded-full bg-slate-200 h-10 w-10"></div>
          <div className="flex-1 space-y-4">
            <div className="h-2 bg-slate-200 rounded w-3/4"></div>
          </div>
        </div> */}

        {/* Form Fields */}
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="grid grid-cols-6 gap-4">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-full col-span-5"></div>
          </div>
        ))}

        {/* Table Skeleton */}
        <div className="grid grid-cols-6 gap-2 border-t pt-4">
          <div className="h-4 bg-slate-200 rounded col-span-1"></div>
          <div className="h-4 bg-slate-200 rounded col-span-2"></div>
          <div className="h-4 bg-slate-200 rounded col-span-1"></div>
          <div className="h-4 bg-slate-200 rounded col-span-1"></div>
          <div className="h-4 bg-slate-200 rounded col-span-1"></div>
        </div>
        <div className="grid grid-cols-6 gap-2 mt-2">
          <div className="h-4 bg-slate-200 rounded col-span-1"></div>
          <div className="h-4 bg-slate-200 rounded col-span-2"></div>
          <div className="h-4 bg-slate-200 rounded col-span-1"></div>
          <div className="h-4 bg-slate-200 rounded col-span-1"></div>
          <div className="h-4 bg-slate-200 rounded col-span-1"></div>
        </div>
      </div>
    </div>
  );
}
