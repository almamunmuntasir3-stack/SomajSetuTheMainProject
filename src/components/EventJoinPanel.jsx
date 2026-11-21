"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2, LogOut, UserPlus, Users } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  getEventById,
  joinEvent as joinEventApi,
  leaveEvent as leaveEventApi,
} from "@/src/lib/api";
import { useSession } from "@/src/lib/auth-client";
import { extractOne, hasJoined, normalizeEvent } from "@/src/lib/eventData";

export default function EventJoinPanel({ event, onEventUpdate }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [localJoin, setLocalJoin] = useState({ id: null, joined: false });
  const [submitting, setSubmitting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // A pending local action wins so the button does not flip back if the
  // backend's joined-volunteers list updates a moment later.
  const joined =
    localJoin.id === event.id ? localJoin.joined : hasJoined(event, user);
  const volunteers = event.currentVolunteers ?? 0;
  const maxVolunteers = event.maxVolunteers ?? 0;
  const spotsLeft = Math.max(maxVolunteers - volunteers, 0);
  const progress =
    maxVolunteers > 0 ? Math.min((volunteers / maxVolunteers) * 100, 100) : 0;

  async function handleJoin() {
    if (isPending) {
      toast.info("Checking your session", {
        description: "Please wait a moment and try again.",
      });
      return;
    }

    if (!user) {
      toast.error("Sign in to join this drive", {
        description: "Use your ShomajSetu account to reserve a volunteer spot.",
      });
      router.push(`/login?redirect=${encodeURIComponent(`/events/${event.id}`)}`);
      return;
    }

    if (joined) {
      toast.info("You're already on the list", {
        description: "Your spot for this drive is already confirmed.",
      });
      return;
    }

    if (spotsLeft === 0) {
      toast.error("This drive is full", {
        description: "All volunteer spots have been claimed.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await joinEventApi(event.id, {
        name: user.name,
        email: user.email,
        userEmail: user.email,
        userId: user.id ?? user._id,
      });

      let refreshed = null;
      try {
        const payload = await getEventById(event.id);
        const raw = extractOne(payload);
        if (raw) refreshed = normalizeEvent(raw);
      } catch {
        // The join already succeeded; keep a local count if refresh is unavailable.
      }

      onEventUpdate?.(
        refreshed ?? {
          ...event,
          currentVolunteers: volunteers + 1,
          registered: volunteers + 1,
        }
      );
      setLocalJoin({ id: event.id, joined: true });
      toast.success("Spot confirmed", {
        description: `You're joining ${event.title}. Thank you for showing up!`,
      });
    } catch (error) {
      toast.error("Could not join this drive", {
        description: error?.message || "Please try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLeave() {
    if (!user || !joined) return;

    setLeaving(true);
    try {
      await leaveEventApi(event.id, user.email);

      let refreshed = null;
      try {
        const payload = await getEventById(event.id);
        const raw = extractOne(payload);
        if (raw) refreshed = normalizeEvent(raw);
      } catch {
        // The leave already succeeded; keep a local count if refresh is unavailable.
      }

      onEventUpdate?.(
        refreshed ?? {
          ...event,
          currentVolunteers: Math.max(volunteers - 1, 0),
          registered: Math.max(volunteers - 1, 0),
        }
      );
      setLocalJoin({ id: event.id, joined: false });
      toast.success("You left the drive", {
        description: `Your spot for ${event.title} has been released.`,
      });
    } catch (error) {
      toast.error("Could not leave this drive", {
        description: error?.message || "Please try again in a moment.",
      });
    } finally {
      setLeaving(false);
    }
  }

  return (
    <div data-event-id={event.id} className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Users className="h-4 w-4 text-primary" aria-hidden="true" />
          Volunteer progress
        </p>
        <p className="text-sm text-muted" aria-live="polite">
          <span className="font-bold text-foreground">{volunteers}</span> of{" "}
          {maxVolunteers} joined
        </p>
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-label="Volunteer spots filled"
        aria-valuenow={volunteers}
        aria-valuemin={0}
        aria-valuemax={Math.max(maxVolunteers, 1)}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-muted">
        {spotsLeft > 0
          ? `${spotsLeft} volunteer ${spotsLeft === 1 ? "spot" : "spots"} still available.`
          : "All volunteer spots have been filled."}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={handleJoin}
          disabled={submitting || leaving || joined || (spotsLeft === 0 && !joined)}
          variant={joined ? "outline" : "default"}
          className="flex-1 sm:flex-none"
        >
          {submitting ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : joined ? (
            <Check aria-hidden="true" />
          ) : (
            <UserPlus aria-hidden="true" />
          )}
          {submitting ? "Joining…" : joined ? "Joined" : "Join Event"}
        </Button>

        {joined ? (
          <Button
            type="button"
            variant="ghost"
            onClick={handleLeave}
            disabled={submitting || leaving}
            className="flex-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 sm:flex-none"
          >
            {leaving ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <LogOut aria-hidden="true" />
            )}
            {leaving ? "Leaving…" : "Leave Event"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
