export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="h-28 animate-pulse rounded-2xl bg-slate-200" key={index} />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}
