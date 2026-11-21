"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertCircle,
  CalendarDays,
  ClipboardList,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";

import FieldError from "@/src/components/FieldError";
import ImagePicker from "@/src/components/ImagePicker";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { deleteEvent, getOrganizerEvents, updateEvent } from "@/src/lib/api";
import { useSession } from "@/src/lib/auth-client";
import { extractList, isOwnedBy, normalizeEvent } from "@/src/lib/eventData";
import { extractImageUrl, isValidImageSource } from "@/src/lib/eventImages";

const categories = [
  "Environment",
  "Tree Plantation",
  "Health Camp",
  "Winter Cloth Drive",
  "Youth Literacy Workshop",
];

function toDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function validate(draft) {
  const errors = {};
  if (!draft.title.trim()) errors.title = "Title is required.";
  else if (draft.title.trim().length < 5) errors.title = "Use at least 5 characters.";
  if (!draft.location.trim()) errors.location = "Location is required.";
  if (!draft.eventDate) errors.eventDate = "Pick a date and time.";
  else if (new Date(draft.eventDate).getTime() <= Date.now())
    errors.eventDate = "Choose a future date and time.";
  const max = Number(draft.maxVolunteers);
  if (!Number.isInteger(max) || max < 1) errors.maxVolunteers = "Enter at least 1 volunteer spot.";
  if (draft.imageUrl?.trim() && !isValidImageSource(draft.imageUrl))
    errors.imageUrl = "Enter a valid http(s) image URL, or leave blank for the default cover.";
  return errors;
}

function EventSkeletonRow() {
  return (
    <Card aria-hidden="true">
      <CardContent className="space-y-4 p-5 sm:p-6">
        <div className="flex gap-2">
          <div className="h-5 w-20 animate-pulse rounded bg-surface-muted" />
          <div className="h-5 w-28 animate-pulse rounded bg-surface-muted" />
        </div>
        <div className="h-6 w-2/3 animate-pulse rounded bg-surface-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-surface-muted" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-surface-muted" />
      </CardContent>
    </Card>
  );
}

export default function ManageEventsList() {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const email = user?.email;
  const userName = user?.name;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [errors, setErrors] = useState({});
  const [mutatingId, setMutatingId] = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!email) return;

    await Promise.resolve();
    setLoading(true);
    setError("");

    try {
      const payload = await getOrganizerEvents(email);
      const currentUser = { email, name: userName };
      const organized = extractList(payload)
        .map(normalizeEvent)
        .filter((event) => isOwnedBy(event, currentUser));
      setEvents(organized);
    } catch (error) {
      setError(error?.message || "Unable to load your hosted events right now.");
    } finally {
      setLoading(false);
    }
  }, [email, userName]);

  useEffect(() => {
    if (isPending || !email) return;
    void Promise.resolve().then(fetchEvents);
  }, [email, fetchEvents, isPending]);

  function startEdit(event) {
    if (!isOwnedBy(event, user)) {
      toast.error("You can only edit events you organized.");
      return;
    }

    setEditingId(event.id);
    setDraft({
      title: event.title,
      location: event.location,
      eventDate: toDateTimeLocal(event.eventDate),
      category: event.category,
      maxVolunteers: String(event.maxVolunteers),
      // Read from raw so a valid non-Unsplash URL is not lost to normalization.
      imageUrl: extractImageUrl(event.raw),
    });
    setErrors({});
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
    setErrors({});
  }

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function saveEdit() {
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Check the edited fields");
      return;
    }

    const event = events.find((item) => item.id === editingId);
    if (!event || !isOwnedBy(event, user)) {
      toast.error("You can only edit events you organized.");
      return;
    }

    setMutatingId(editingId);
    try {
      const isoDate = new Date(draft.eventDate).toISOString();
      const coverUrl = draft.imageUrl?.trim() ?? "";
      await updateEvent(editingId, {
        title: draft.title.trim(),
        location: draft.location.trim(),
        category: draft.category,
        eventDate: isoDate,
        date: isoDate,
        maxVolunteers: Number(draft.maxVolunteers),
        imageUrl: coverUrl,
        image: coverUrl,
        organizerEmail: email,
      });

      toast.success("Event updated", { description: draft.title.trim() });
      cancelEdit();
      await fetchEvents();
    } catch (error) {
      toast.error("Could not update this event", {
        description: error?.message || "Please try again in a moment.",
      });
    } finally {
      setMutatingId(null);
    }
  }

  async function performDelete(event) {
    setMutatingId(event.id);
    try {
      await deleteEvent(event.id, email);
      toast.success("Event deleted", { description: event.title });
      if (editingId === event.id) cancelEdit();
      await fetchEvents();
    } catch (error) {
      toast.error("Could not delete this event", {
        description: error?.message || "Please try again in a moment.",
      });
    } finally {
      setMutatingId(null);
    }
  }

  function removeEvent(event) {
    if (!isOwnedBy(event, user)) {
      toast.error("You can only delete events you organized.");
      return;
    }

    toast("Delete this event?", {
      description: `"${event.title}" will be removed permanently. This cannot be undone.`,
      action: { label: "Delete", onClick: () => void performDelete(event) },
      cancel: { label: "Cancel" },
    });
  }

  return (
    <div className="mt-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {loading
            ? "Loading your hosted events…"
            : error
              ? "Your hosted events could not be loaded."
              : (
                  <>
                    You are hosting <span className="font-semibold text-foreground">{events.length}</span>{" "}
                    {events.length === 1 ? "event" : "events"}
                  </>
                )}
        </p>
        <Button asChild>
          <Link href="/create-event">
            <Plus aria-hidden="true" />
            New event
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="mt-5 space-y-4" aria-busy="true">
          {Array.from({ length: 3 }, (_, index) => (
            <EventSkeletonRow key={index} />
          ))}
        </div>
      ) : error ? (
        <Card className="mt-5">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Could not load your events</h2>
              <p className="mt-1 max-w-md text-sm leading-6 text-muted" role="alert">
                {error}
              </p>
            </div>
            <Button onClick={fetchEvents} variant="outline" className="mt-2">
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : events.length > 0 ? (
        <div className="mt-5 space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-5 sm:p-6">
                {editingId === event.id && draft ? (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Pencil className="h-4 w-4 text-primary" aria-hidden="true" />
                      Editing event
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`edit-title-${event.id}`}>Title</Label>
                      <Input
                        id={`edit-title-${event.id}`}
                        value={draft.title}
                        onChange={(e) => updateDraft("title", e.target.value)}
                        disabled={mutatingId === event.id}
                        aria-invalid={Boolean(errors.title)}
                        aria-describedby={errors.title ? `edit-title-error-${event.id}` : undefined}
                      />
                      <FieldError id={`edit-title-error-${event.id}`}>{errors.title}</FieldError>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-location-${event.id}`}>Location</Label>
                        <Input
                          id={`edit-location-${event.id}`}
                          value={draft.location}
                          onChange={(e) => updateDraft("location", e.target.value)}
                          disabled={mutatingId === event.id}
                          aria-invalid={Boolean(errors.location)}
                          aria-describedby={errors.location ? `edit-location-error-${event.id}` : undefined}
                        />
                        <FieldError id={`edit-location-error-${event.id}`}>{errors.location}</FieldError>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-date-${event.id}`}>Date &amp; time</Label>
                        <Input
                          id={`edit-date-${event.id}`}
                          type="datetime-local"
                          value={draft.eventDate}
                          onChange={(e) => updateDraft("eventDate", e.target.value)}
                          disabled={mutatingId === event.id}
                          aria-invalid={Boolean(errors.eventDate)}
                          aria-describedby={errors.eventDate ? `edit-date-error-${event.id}` : undefined}
                        />
                        <FieldError id={`edit-date-error-${event.id}`}>{errors.eventDate}</FieldError>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-category-${event.id}`}>Category</Label>
                        <select
                          id={`edit-category-${event.id}`}
                          value={draft.category}
                          onChange={(e) => updateDraft("category", e.target.value)}
                          disabled={mutatingId === event.id}
                          className="flex h-11 w-full rounded-xl border border-line bg-surface px-4 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-volunteers-${event.id}`}>Max volunteers</Label>
                        <Input
                          id={`edit-volunteers-${event.id}`}
                          type="number"
                          min="1"
                          value={draft.maxVolunteers}
                          onChange={(e) => updateDraft("maxVolunteers", e.target.value)}
                          disabled={mutatingId === event.id}
                          aria-invalid={Boolean(errors.maxVolunteers)}
                          aria-describedby={errors.maxVolunteers ? `edit-volunteers-error-${event.id}` : undefined}
                        />
                        <FieldError id={`edit-volunteers-error-${event.id}`}>{errors.maxVolunteers}</FieldError>
                      </div>
                    </div>

                    <ImagePicker
                      value={draft.imageUrl}
                      onChange={(value) => updateDraft("imageUrl", value)}
                      idPrefix={`edit-image-${event.id}`}
                      disabled={mutatingId === event.id}
                      error={errors.imageUrl}
                    />

                    <div className="flex flex-wrap gap-3">
                      <Button onClick={saveEdit} disabled={mutatingId === event.id}>
                        {mutatingId === event.id ? (
                          <Loader2 className="animate-spin" aria-hidden="true" />
                        ) : (
                          <Save aria-hidden="true" />
                        )}
                        Save changes
                      </Button>
                      <Button variant="outline" onClick={cancelEdit} disabled={mutatingId === event.id}>
                        <X aria-hidden="true" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={event.status === "Published" ? "default" : "outline"}>
                          {event.status}
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
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                          <dd>{event.currentVolunteers} of {event.maxVolunteers} volunteers joined</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(event)}>
                        <Pencil aria-hidden="true" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEvent(event)}
                        disabled={mutatingId === event.id}
                      >
                        <Trash2 aria-hidden="true" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-5">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <ClipboardList className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold text-foreground">No hosted events yet</h2>
            <p className="max-w-md text-sm leading-6 text-muted">
              Start a drive and it will appear here for editing and management.
            </p>
            <Button asChild className="mt-2">
              <Link href="/create-event">
                <Plus aria-hidden="true" />
                Create an event
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
