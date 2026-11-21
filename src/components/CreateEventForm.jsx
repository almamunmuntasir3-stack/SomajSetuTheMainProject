"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarPlus,
  Info,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";

import FieldError from "@/src/components/FieldError";
import ImagePicker from "@/src/components/ImagePicker";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { createEvent } from "@/src/lib/api";
import { useSession } from "@/src/lib/auth-client";
import { isValidImageSource } from "@/src/lib/eventImages";

const categories = [
  "Environment",
  "Tree Plantation",
  "Health Camp",
  "Winter Cloth Drive",
  "Youth Literacy Workshop",
];

const initialForm = {
  title: "",
  category: categories[0],
  description: "",
  location: "",
  eventDate: "",
  maxVolunteers: "",
  // No preselected cover: an untouched form must not store a shared preset.
  imageUrl: "",
};

function validate(values) {
  const errors = {};

  if (!values.title.trim()) errors.title = "Give your event a title.";
  else if (values.title.trim().length < 5)
    errors.title = "Use at least 5 characters.";

  if (!values.category) errors.category = "Choose a category.";

  if (!values.description.trim()) errors.description = "Describe the drive.";
  else if (values.description.trim().length < 20)
    errors.description = "Add at least 20 characters so volunteers know what to expect.";

  if (!values.location.trim()) errors.location = "Add a location.";

  if (!values.eventDate) errors.eventDate = "Pick a date and time.";
  else if (new Date(values.eventDate).getTime() <= Date.now())
    errors.eventDate = "Choose a future date and time.";

  const max = Number(values.maxVolunteers);
  if (!values.maxVolunteers) errors.maxVolunteers = "Set a volunteer target.";
  else if (!Number.isInteger(max) || max < 1)
    errors.maxVolunteers = "Enter a whole number of at least 1.";

  if (values.imageUrl.trim() && !isValidImageSource(values.imageUrl))
    errors.imageUrl = "Enter a valid http(s) image URL, or leave blank for the default cover.";

  return errors;
}

export default function CreateEventForm() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Check the highlighted fields", {
        description: "A few details still need attention before publishing.",
      });
      return;
    }

    if (!user) {
      toast.error("Sign in to publish an event");
      return;
    }

    const maxVolunteers = Number(form.maxVolunteers);
    const isoDate = new Date(form.eventDate).toISOString();
    const coverUrl = form.imageUrl.trim();

    setSubmitting(true);
    try {
      await createEvent({
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        location: form.location.trim(),
        eventDate: isoDate,
        date: isoDate,
        maxVolunteers,
        volunteersNeeded: maxVolunteers,
        // Send both names so either backend field convention persists the
        // chosen cover instead of silently dropping it.
        imageUrl: coverUrl,
        image: coverUrl,
        organizer: user.name,
        organizerName: user.name,
        organizerEmail: user.email,
      });

      toast.success("Event created", {
        description: `${form.title.trim()} is ready to welcome volunteers.`,
      });
      router.push("/manage-events");
      router.refresh();
    } catch (error) {
      toast.error("Could not create this event", {
        description: error?.message || "Please try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-9 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-primary" aria-hidden="true" />
            Event details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="event-title">Event title</Label>
              <Input
                id="event-title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Weekend Riverbank Cleanup"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "title-error" : undefined}
                disabled={submitting}
              />
              <FieldError id="title-error">{errors.title}</FieldError>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="event-category">Category</Label>
                <select
                  id="event-category"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  disabled={submitting}
                  className="flex h-11 w-full rounded-xl border border-line bg-surface px-4 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <FieldError id="category-error">{errors.category}</FieldError>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-date">Date &amp; time</Label>
                <Input
                  id="event-date"
                  type="datetime-local"
                  value={form.eventDate}
                  onChange={(e) => update("eventDate", e.target.value)}
                  disabled={submitting}
                  aria-invalid={Boolean(errors.eventDate)}
                  aria-describedby={errors.eventDate ? "date-error" : undefined}
                />
                <FieldError id="date-error">{errors.eventDate}</FieldError>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="What will volunteers do, and what will the community gain?"
                disabled={submitting}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? "description-error" : undefined}
              />
              <FieldError id="description-error">{errors.description}</FieldError>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="event-location">Location</Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                  <Input
                    id="event-location"
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                    placeholder="Landmark, area, city"
                    className="pl-9"
                    disabled={submitting}
                    aria-invalid={Boolean(errors.location)}
                    aria-describedby={errors.location ? "location-error" : undefined}
                  />
                </div>
                <FieldError id="location-error">{errors.location}</FieldError>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-volunteers">Max volunteers</Label>
                <div className="relative">
                  <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                  <Input
                    id="event-volunteers"
                    type="number"
                    min="1"
                    value={form.maxVolunteers}
                    onChange={(e) => update("maxVolunteers", e.target.value)}
                    placeholder="e.g. 60"
                    className="pl-9"
                    disabled={submitting}
                    aria-invalid={Boolean(errors.maxVolunteers)}
                    aria-describedby={errors.maxVolunteers ? "volunteers-error" : undefined}
                  />
                </div>
                <FieldError id="volunteers-error">{errors.maxVolunteers}</FieldError>
              </div>
            </div>

            <ImagePicker
              value={form.imageUrl}
              onChange={(value) => update("imageUrl", value)}
              idPrefix="create-event-image"
              disabled={submitting}
              error={errors.imageUrl}
            />

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" size="lg" disabled={submitting || isPending}>
                {submitting ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : null}
                {submitting ? "Publishing…" : "Publish event"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  setForm(initialForm);
                  setErrors({});
                }}
                disabled={submitting}
              >
                Clear form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" aria-hidden="true" />
              Hosting tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm leading-6 text-muted">
              <li>• Name a precise meeting point and time.</li>
              <li>• Explain the tasks so volunteers can prepare.</li>
              <li>• Set a realistic volunteer target for the space.</li>
              <li>• Use a bright, clear photo of the actual activity.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary-soft">
          <CardContent className="p-5">
            <Badge className="mb-3">Publishing as</Badge>
            <p className="text-sm font-semibold text-foreground">
              {isPending ? "Loading your account…" : user?.name || "Your ShomajSetu account"}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted">
              {user?.email || "Your email is attached to the event for organizer verification."}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              After publishing, the drive appears in Manage Events and in the public
              upcoming events list.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
