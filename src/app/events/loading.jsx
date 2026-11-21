import EventSkeleton from "@/src/components/EventSkeleton";

export default function EventsLoading() {
  return (
    <div className="border-b border-line bg-surface-muted">
      <div className="shell-container py-14 lg:py-16">
        <div className="h-3 w-32 animate-pulse rounded bg-surface-muted" />
        <div className="mt-3 h-9 w-72 max-w-full animate-pulse rounded bg-surface-muted" />
        <div className="mt-4 h-5 w-full max-w-xl animate-pulse rounded bg-surface-muted" />

        <div className="mt-9 h-28 animate-pulse rounded-2xl bg-surface-muted" />
        <div className="mt-6 h-4 w-56 animate-pulse rounded bg-surface-muted" />

        <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading events">
          {Array.from({ length: 6 }, (_, index) => (
            <EventSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
