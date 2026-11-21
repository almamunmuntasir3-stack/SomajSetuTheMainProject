"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, RefreshCw, Search, SearchX, X } from "lucide-react";

import EventCard from "@/src/components/EventCard";
import EventSkeleton from "@/src/components/EventSkeleton";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { getUpcomingEvents } from "@/src/lib/api";
import { extractList, isUpcomingEvent, normalizeEvent } from "@/src/lib/eventData";
import { cn } from "@/src/lib/utils";

const SEARCH_DELAY_MS = 350;

export default function EventsExplorer({ categories = [] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const requestRef = useRef(0);

  const options = ["All", ...categories.filter((item) => item !== "All")];

  useEffect(() => {
    const requestId = ++requestRef.current;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const payload = await getUpcomingEvents({
          search: query.trim(),
          category: category === "All" ? "" : category,
        });
        if (requestRef.current !== requestId) return;
        setEvents(extractList(payload).map(normalizeEvent).filter(isUpcomingEvent));
      } catch (error) {
        if (requestRef.current !== requestId) return;
        setEvents([]);
        setError(error?.message || "Unable to load upcoming events right now.");
      } finally {
        if (requestRef.current === requestId) setLoading(false);
      }
    }, SEARCH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [query, category, reloadKey]);

  const term = query.trim().toLowerCase();
  const visibleEvents = events.filter((event) => {
    const matchesCategory =
      category === "All" || event.category === category || event.categoryGroup === category;
    const matchesTerm =
      !term ||
      [event.title, event.location, event.description].some((field) =>
        field.toLowerCase().includes(term)
      );

    return matchesCategory && matchesTerm;
  });

  const hasFilters = term !== "" || category !== "All";

  function resetFilters() {
    setQuery("");
    setCategory("All");
  }

  return (
    <div className="mt-9">
      <Card className="p-4 sm:p-5">
        <CardContent className="flex flex-col gap-5 p-0">
          <div>
            <label htmlFor="event-search" className="sr-only">
              Search events
            </label>
            <div className="relative max-w-2xl">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <Input
                id="event-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, location, or description…"
                className="pl-9 pr-10"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted transition hover:text-foreground"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {options.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  category === item
                    ? "border-primary bg-primary text-[var(--primary-foreground)]"
                    : "border-line bg-surface-raised text-muted hover:border-primary hover:text-primary"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {loading ? (
            "Loading upcoming events…"
          ) : (
            <>
              Showing <span className="font-semibold text-foreground">{visibleEvents.length}</span>{" "}
              of {events.length} upcoming events
            </>
          )}
        </p>
        {hasFilters && !loading ? (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear filters
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div
          className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          aria-label="Loading events"
          aria-busy="true"
        >
          {Array.from({ length: 6 }, (_, index) => (
            <EventSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <Card className="mt-4">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold text-foreground">Could not load events</h2>
            <p className="max-w-md text-sm leading-6 text-muted" role="alert">
              {error}
            </p>
            <Button
              className="mt-2"
              variant="outline"
              onClick={() => setReloadKey((value) => value + 1)}
            >
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : visibleEvents.length > 0 ? (
        <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <Card className="mt-4">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <SearchX className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold text-foreground">
              No events match those filters
            </h2>
            <p className="max-w-md text-sm leading-6 text-muted">
              Try a different keyword or category, or start over to see every
              upcoming community drive.
            </p>
            <Button onClick={resetFilters} className="mt-2">
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
