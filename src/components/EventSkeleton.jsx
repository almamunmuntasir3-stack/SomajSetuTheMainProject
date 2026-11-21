import { Card, CardContent } from "@/src/components/ui/card";

/**
 * Loading placeholder shaped like EventCard: same 13rem cover, card padding,
 * three metadata rows and footer link, so layout does not jump on load.
 */
export default function EventSkeleton() {
  return (
    <Card className="h-full overflow-hidden" aria-hidden="true">
      <div className="h-52 w-full animate-pulse bg-surface-muted" />

      <CardContent className="flex h-[19rem] flex-col p-5">
        <div className="space-y-2">
          <div className="h-5 w-11/12 animate-pulse rounded bg-surface-muted" />
          <div className="h-5 w-3/5 animate-pulse rounded bg-surface-muted" />
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-3.5 w-full animate-pulse rounded bg-surface-muted" />
          <div className="h-3.5 w-full animate-pulse rounded bg-surface-muted" />
          <div className="h-3.5 w-4/5 animate-pulse rounded bg-surface-muted" />
        </div>

        <div className="mt-5 space-y-3">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center gap-2">
              <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-surface-muted" />
              <div
                className="h-3.5 animate-pulse rounded bg-surface-muted"
                style={{ width: `${[78, 64, 70][row]}%` }}
              />
            </div>
          ))}
        </div>

        <div className="mt-5 h-4 w-28 animate-pulse rounded bg-surface-muted" />
      </CardContent>
    </Card>
  );
}
