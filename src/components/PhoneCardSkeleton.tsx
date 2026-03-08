export function PhoneCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="aspect-square bg-secondary/50" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-4 w-14 bg-secondary rounded-full" />
          <div className="h-4 w-10 bg-secondary rounded-full" />
        </div>
        <div className="h-3 w-16 bg-secondary/70 rounded" />
        <div className="h-5 w-3/4 bg-secondary rounded" />
        <div className="space-y-1.5 mt-2">
          <div className="h-3 w-full bg-secondary/60 rounded" />
          <div className="h-3 w-5/6 bg-secondary/60 rounded" />
          <div className="h-3 w-4/6 bg-secondary/60 rounded" />
        </div>
        <div className="h-6 w-24 bg-primary/20 rounded mt-2" />
        <div className="h-9 w-full bg-secondary/50 rounded-lg mt-1" />
      </div>
    </div>
  );
}
