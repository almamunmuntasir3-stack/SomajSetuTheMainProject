"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Building2, CalendarDays, MapPin } from "lucide-react";

import EventJoinPanel from "@/src/components/EventJoinPanel";
import SafeImage from "@/src/components/SafeImage";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { getEventById } from "@/src/lib/api";
import { extractOne, normalizeEvent } from "@/src/lib/eventData";

export default function EventDetails({ id }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      await Promise.resolve();
      if (!active) return;
      setLoading(true);
      setError("");

      try {
        const payload = await getEventById(id);
        if (!active) return;
        const raw = extractOne(payload);
        if (!raw) {
          setError("This event could not be found.");
          return;
        }
        setEvent(normalizeEvent(raw));
      } catch (error) {
        if (active) setError(error?.message || "Unable to load this event right now.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mt-9 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]" aria-busy="true">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="h-72 w-full animate-pulse bg-surface-muted" />
          <div className="space-y-3 p-6">
            <div className="h-5 w-24 animate-pulse rounded bg-surface-muted" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-surface-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-surface-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-surface-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
          </div>
        </div>
        <div className="h-64 animate-pulse rounded-2xl border border-line bg-surface-muted" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <Card className="mt-9">
        <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Event unavailable</h2>
            <p className="mt-1 max-w-md text-sm leading-6 text-muted" role="alert">
              {error || "This event could not be found."}
            </p>
          </div>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/events">
              <ArrowLeft aria-hidden="true" />
              Back to events
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-9 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
      <Card className="overflow-hidden">
        <div className="relative h-72 sm:h-96">
          <SafeImage
            key={event.imageUrl}
            src={event.imageUrl}
            alt={event.title}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
            priority
          />
          <div className="absolute left-5 top-5">
            <Badge variant="outline" className="bg-surface/90 shadow-sm">
              {event.category}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            {event.title}
          </h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted sm:text-base">
            {event.description}
          </p>

          <dl className="mt-7 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Date</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{event.dateLabel}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Location</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{event.location}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:col-span-2">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Organizer</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{event.organizer}</dd>
              </div>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <EventJoinPanel event={event} onEventUpdate={setEvent} />

        <Card>
          <CardContent className="p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-foreground">Before you join</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
              <li>• Review the date, time, and meeting point carefully.</li>
              <li>• Bring water, comfortable clothing, and any listed supplies.</li>
              <li>• You can manage your commitments from the joined events page.</li>
            </ul>
            <Button asChild variant="link" className="mt-4 h-auto p-0">
              <Link href="/events">
                <ArrowLeft aria-hidden="true" />
                Browse other drives
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
