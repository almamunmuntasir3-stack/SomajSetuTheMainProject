"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  HeartHandshake,
  MapPin,
  RefreshCw,
  Sparkles,
  Star,
  Store,
  UserRound,
} from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import {
  getDashboardData,
  getJoinedEvents,
  getOrganizerEvents,
  getUserProfile,
} from "@/src/lib/api";
import { useSession } from "@/src/lib/auth-client";
import {
  extractList,
  extractOne,
  hasJoined,
  isOwnedBy,
  normalizeActivity,
  normalizeEvent,
  normalizeProfile,
} from "@/src/lib/eventData";

const ACTIVITY_ICONS = {
  join: HeartHandshake,
  organize: Store,
  points: Sparkles,
  milestone: Star,
  activity: CalendarDays,
};

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function StatSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardContent className="space-y-4 p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
        <div className="h-8 w-16 animate-pulse rounded bg-surface-muted" />
        <div className="h-3 w-32 animate-pulse rounded bg-surface-muted" />
      </CardContent>
    </Card>
  );
}

export default function DashboardContent() {
  const { data: session } = useSession();
  const user = session?.user;
  const email = user?.email;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!email) return;

    await Promise.resolve();
    setLoading(true);
    setError("");

    try {
      const [dashboardPayload, profilePayload, joinedPayload, organizedPayload] =
        await Promise.all([
          getDashboardData(email).catch(() => null),
          getUserProfile(email).catch(() => null),
          getJoinedEvents(email).catch(() => null),
          getOrganizerEvents(email).catch(() => null),
        ]);

      if (
        !dashboardPayload &&
        !profilePayload &&
        !joinedPayload &&
        !organizedPayload
      ) {
        throw new Error("Unable to load dashboard information right now.");
      }

      const currentUser = { email, name: user?.name };
      const dashboard = extractOne(dashboardPayload);
      const profile = normalizeProfile(profilePayload);
      const joined = extractList(joinedPayload)
        .map(normalizeEvent)
        .filter(
          (event) =>
            event.joinedEmails.length === 0 || hasJoined(event, currentUser)
        );
      const organized = extractList(organizedPayload)
        .map(normalizeEvent)
        .filter((event) => isOwnedBy(event, currentUser));

      const statsSource = dashboard?.stats ?? dashboard?.summary ?? dashboard ?? {};
      const joinedFromApi = extractList(
        dashboard?.commitments ?? dashboard?.joinedEvents ?? dashboard?.upcomingEvents
      ).map(normalizeEvent);
      const commitments = joinedFromApi.length > 0 ? joinedFromApi : joined;

      const activitySource =
        dashboard?.activities ?? dashboard?.recentActivity ?? dashboard?.activity;
      const activities = activitySource
        ? extractList(activitySource).map(normalizeActivity)
        : [
            ...joined.slice(0, 3).map((event) => ({
              id: `join-${event.id}`,
              title: `Joined ${event.title}`,
              detail: `${event.location} • ${event.dateLabel}`,
              when: event.dateLabel,
              type: "join",
            })),
            ...organized.slice(0, 2).map((event) => ({
              id: `host-${event.id}`,
              title: `Organizing ${event.title}`,
              detail: `${event.currentVolunteers} volunteers joined so far`,
              when: event.dateLabel,
              type: "organize",
            })),
          ];

      const upcomingJoined = commitments.filter((event) => {
        if (!event.eventDate) return false;
        const timestamp = new Date(event.eventDate).getTime();
        return Number.isFinite(timestamp) && timestamp > Date.now();
      }).length;
      const published = organized.filter(
        (event) => event.status === "Published"
      ).length;

      setData({
        profile,
        commitments,
        activities,
        stats: [
          {
            key: "eventsJoined",
            label: "Events Joined",
            value: asNumber(
              statsSource.eventsJoined ?? statsSource.joinedEvents,
              joined.length
            ),
            icon: CalendarDays,
            detail: `${upcomingJoined} upcoming ${upcomingJoined === 1 ? "drive" : "drives"}`,
          },
          {
            key: "eventsHosted",
            label: "Events Hosted",
            value: asNumber(
              statsSource.eventsHosted ?? statsSource.organizedEvents,
              organized.length
            ),
            icon: Store,
            detail: `${published} published ${published === 1 ? "drive" : "drives"}`,
          },
          {
            key: "volunteerHours",
            label: "Volunteer Hours",
            value: asNumber(statsSource.volunteerHours ?? statsSource.hours, profile.volunteerHours),
            icon: Clock3,
            detail: "Recorded on your volunteer profile",
          },
          {
            key: "impactPoints",
            label: "Impact Points",
            value: asNumber(statsSource.impactPoints ?? statsSource.points, profile.impactPoints),
            icon: Star,
            detail: "Earned through community service",
          },
        ],
      });
    } catch (error) {
      setError(error?.message || "Unable to load dashboard information right now.");
    } finally {
      setLoading(false);
    }
    // The user's name is only used for ownership checks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  useEffect(() => {
    if (!email) return;
    void Promise.resolve().then(load);
  }, [email, load]);

  const firstName = useMemo(() => {
    const name = user?.name?.trim();
    return name ? name.split(/\s+/)[0] : "volunteer";
  }, [user?.name]);

  if (loading) {
    return (
      <div className="mt-9" aria-busy="true">
        <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
        <div className="mt-3 h-9 w-64 max-w-full animate-pulse rounded bg-surface-muted" />
        <div className="mt-4 h-5 w-full max-w-xl animate-pulse rounded bg-surface-muted" />
        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <StatSkeleton key={index} />
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="h-80 animate-pulse rounded-2xl border border-line bg-surface-muted" />
          <div className="h-80 animate-pulse rounded-2xl border border-line bg-surface-muted" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="mt-9">
        <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Dashboard unavailable</h2>
            <p className="mt-1 max-w-md text-sm leading-6 text-muted" role="alert">
              {error || "Your volunteer information could not be loaded."}
            </p>
          </div>
          <Button onClick={load} variant="outline" className="mt-2">
            <RefreshCw aria-hidden="true" />
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-9">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-eyebrow">Volunteer Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            Here is the difference you and your neighbors are making across
            Bangladesh.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/profile">
              <UserRound aria-hidden="true" />
              My profile
            </Link>
          </Button>
          <Button asChild>
            <Link href="/events">
              Find a drive
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map(({ key, label, value, icon: Icon, detail }) => (
          <Card key={key}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {label}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
                    {value.toLocaleString()}
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-xs text-muted">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>Upcoming commitments</CardTitle>
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link href="/joined-events">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.commitments.length > 0 ? (
              data.commitments.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={item.status === "Pending" ? "outline" : "default"}>
                        {item.status || "Confirmed"}
                      </Badge>
                      <span className="text-xs font-medium text-muted">{item.dateLabel}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {item.location}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="self-start">
                    <Link href={`/events/${item.id}`}>
                      Details
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-line bg-surface-muted p-5 text-sm text-muted">
                You have no upcoming commitments. Find a drive and join one to see it here.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent contribution activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data.activities.length > 0 ? (
              <ol className="relative space-y-5 border-l border-line pl-5">
                {data.activities.slice(0, 5).map((item) => {
                  const Icon = ACTIVITY_ICONS[item.type] ?? CalendarDays;
                  return (
                    <li key={item.id} className="relative">
                      <span className="absolute -left-[2.15rem] flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      {item.detail ? (
                        <p className="mt-1 text-xs leading-5 text-muted">{item.detail}</p>
                      ) : null}
                      {item.when ? (
                        <p className="mt-1 text-xs text-muted">{item.when}</p>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="rounded-2xl border border-line bg-surface-muted p-5 text-sm text-muted">
                Your recent joins, hosted drives, and impact milestones will appear here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
