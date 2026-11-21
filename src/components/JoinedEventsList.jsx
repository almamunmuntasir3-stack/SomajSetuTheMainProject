"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  Loader2,
  LogOut,
  MapPin,
  RefreshCw,
  TicketCheck,
} from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import EventSkeleton from "@/src/components/EventSkeleton";

export default function JoinedEventsList({
  events,
  loading,
  error,
  leavingId,
  onRetry,
  onLeave,
}) {
  return (
    <div className="mt-9">
      <p className="text-sm text-muted" aria-live="polite">
        {loading
          ? "Loading your commitments…"
          : error
            ? "Your joined events could not be loaded."
            : (
                <>
                  You have joined <span className="font-semibold text-foreground">{events.length}</span>{" "}
                  {events.length === 1 ? "drive" : "drives"}
                </>
              )}
      </p>

      {loading ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2" aria-busy="true">
          {Array.from({ length: 2 }, (_, index) => (
            <EventSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <Card className="mt-5">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Could not load joined events
              </h2>
              <p className="mt-1 max-w-md text-sm leading-6 text-muted" role="alert">
                {error}
              </p>
            </div>
            <Button onClick={onRetry} variant="outline" className="mt-2">
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : events.length > 0 ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={event.status === "Pending" ? "outline" : "default"}>
                    {event.status || "Confirmed"}
                  </Badge>
                  <Badge variant="secondary">{event.category}</Badge>
                </div>

                <h2 className="mt-3 text-lg font-semibold leading-snug text-foreground">
                  {event.title}
                </h2>

                <dl className="mt-3 space-y-2 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <dd>{event.dateLabel}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <dd>{event.location}</dd>
                  </div>
                </dl>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/events/${event.id}`}>
                      View details
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLeave(event)}
                    disabled={leavingId === event.id}
                  >
                    {leavingId === event.id ? (
                      <Loader2 className="animate-spin" aria-hidden="true" />
                    ) : (
                      <LogOut aria-hidden="true" />
                    )}
                    Leave Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-5">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <TicketCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold text-foreground">No joined event yet</h2>
            <p className="max-w-md text-sm leading-6 text-muted">
              Explore upcoming drives and join one to see it listed here.
            </p>
            <Button asChild className="mt-2">
              <Link href="/events">Browse events</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
