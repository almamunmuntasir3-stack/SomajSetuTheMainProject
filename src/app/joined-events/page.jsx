"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import JoinedEventsList from "@/src/components/JoinedEventsList";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { getAuthToken, useSession } from "@/src/lib/auth-client";
import { getJoinedEvents, leaveEvent } from "@/src/lib/api";
import { extractList, hasJoined, normalizeEvent } from "@/src/lib/eventData";

export default function JoinedEventsPage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const email = user?.email;
  const userName = user?.name;
  const userId = user?.id ?? user?._id;
  const normalizedEmail = email ? String(email).trim().toLowerCase() : "";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leavingId, setLeavingId] = useState(null);
  const requestIdRef = useRef(0);

  const loadJoined = useCallback(async () => {
    if (!normalizedEmail) return;

    const requestId = ++requestIdRef.current;
    await Promise.resolve();
    if (requestId !== requestIdRef.current) return;

    setLoading(true);
    setError("");

    try {
      // Resolve the token first so the request is ready to authenticate, but
      // do not block the public joined-events endpoint if token minting fails.
      const token = await getAuthToken();
      if (requestId !== requestIdRef.current) return;

      const payload = await getJoinedEvents(normalizedEmail, token);
      if (requestId !== requestIdRef.current) return;

      // The API returns either a bare array or an envelope such as { events }.
      const rawEvents = extractList(payload);
      const currentUser = { email: normalizedEmail, name: userName, id: userId };
      const matches = rawEvents
        .map(normalizeEvent)
        .filter((event) => hasJoined(event, currentUser));

      setEvents(matches);
    } catch (loadError) {
      if (requestId === requestIdRef.current) {
        const message =
          loadError?.message || "Unable to load your joined events right now.";
        setError(message);
        toast.error("Could not load joined events", { description: message });
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [normalizedEmail, userName, userId]);

  useEffect(() => {
    if (isPending || !normalizedEmail) return;
    void Promise.resolve().then(loadJoined);
  }, [isPending, normalizedEmail, loadJoined]);

  async function handleLeave(event) {
    setLeavingId(event.id);

    try {
      await leaveEvent(event.id, normalizedEmail);
      toast.success("You left the event", {
        description: `${event.title} has been removed from your commitments.`,
      });
      setEvents((current) => current.filter((item) => item.id !== event.id));
    } catch (leaveError) {
      toast.error("Could not leave this event", {
        description: leaveError?.message || "Please try again in a moment.",
      });
    } finally {
      setLeavingId(null);
    }
  }

  return (
    <ProtectedRoute>
      <div className="border-b border-line bg-surface-muted">
        <div className="shell-container py-12 lg:py-16">
          <p className="section-eyebrow">My Commitments</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Joined events
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            Your upcoming volunteer commitments in one place. Review the details
            before you head out, or leave a drive if plans change.
          </p>

          <JoinedEventsList
            events={events}
            loading={loading}
            error={error}
            leavingId={leavingId}
            onRetry={loadJoined}
            onLeave={handleLeave}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
