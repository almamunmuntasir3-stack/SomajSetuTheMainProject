"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, RefreshCw } from "lucide-react";

import EventCard from "@/src/components/EventCard";
import EventSkeleton from "@/src/components/EventSkeleton";
import { Button } from "@/src/components/ui/button";
import { getLatestEvents } from "@/src/lib/api";
import { extractList, isUpcomingEvent, normalizeEvent } from "@/src/lib/eventData";

export default function UpcomingEventsSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      // Defer past the effect flush so loading state is not set synchronously.
      await Promise.resolve();
      setLoading(true);
      setError("");

      try {
        const payload = await getLatestEvents();
        if (!active) return;
        setEvents(
          extractList(payload)
            .map(normalizeEvent)
            .filter(isUpcomingEvent)
            .slice(0, 6)
        );
      } catch (error) {
        if (active) setError(error?.message || "Unable to load upcoming events right now.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const retry = useCallback(() => setReloadKey((value) => value + 1), []);

  return (
    <section className="border-y border-line bg-surface-muted py-16 lg:py-20">
      <div className="shell-container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="section-eyebrow">Latest Opportunities</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Upcoming events worth showing up for
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
              Six upcoming community drives, ordered by date. Pick a cause,
              bring a friend, and make a measurable difference.
            </p>
          </div>
          <Button asChild variant="outline" className="self-start">
            <Link href="/events">
              View All Upcoming Events
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div
            className="mt-9 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            aria-label="Loading latest events"
            aria-busy="true"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <EventSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="mt-9 flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface-raised px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Could not load events</h3>
              <p className="mt-1 max-w-md text-sm leading-6 text-muted" role="alert">
                {error}
              </p>
            </div>
            <Button onClick={retry} variant="outline">
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : events.length > 0 ? (
          <div className="mt-9 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="mt-9 rounded-2xl border border-line bg-surface-raised p-8 text-center text-muted">
            New drives are being planned. Check back soon or start one yourself.
          </p>
        )}
      </div>
    </section>
  );
}
