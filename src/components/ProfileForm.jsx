"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  BadgeCheck,
  Loader2,
  Mail,
  RefreshCw,
  Save,
  UserRound,
} from "lucide-react";

import FieldError from "@/src/components/FieldError";
import SafeImage from "@/src/components/SafeImage";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { getUserProfile, updateUserProfile } from "@/src/lib/api";
import { useSession } from "@/src/lib/auth-client";
import { extractOne, normalizeProfile } from "@/src/lib/eventData";
import { AVATAR_FALLBACK } from "@/src/lib/eventImages";

const emptyProfile = {
  name: "",
  email: "",
  role: "Community Volunteer",
  bio: "",
  avatarUrl: "",
  volunteerHours: 0,
  impactPoints: 0,
  contributions: 0,
};

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Name is required.";
  else if (values.name.trim().length < 2) errors.name = "Use at least 2 characters.";

  if (!values.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "Enter a valid email address.";

  if (!values.role.trim()) errors.role = "Add your role.";
  else if (values.role.trim().length < 2) errors.role = "Use at least 2 characters.";

  if (!values.bio.trim()) errors.bio = "Add a short bio.";
  else if (values.bio.trim().length < 10) errors.bio = "Use at least 10 characters.";

  return errors;
}

export default function ProfileForm() {
  const { data: session, isPending } = useSession();
  const email = session?.user?.email;

  const [profile, setProfile] = useState(emptyProfile);
  const [form, setForm] = useState(emptyProfile);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadProfile() {
    if (!email) return;

    await Promise.resolve();
    setLoading(true);
    setLoadError("");

    try {
      const payload = await getUserProfile(email);
      const next = normalizeProfile(payload);
      const withEmail = { ...next, email: next.email || email };
      setProfile(withEmail);
      setForm(withEmail);
    } catch (error) {
      setLoadError(error?.message || "Unable to load your profile right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isPending || !email) return;
    void Promise.resolve().then(loadProfile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, isPending]);

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
      toast.error("Check your profile details");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role.trim(),
        bio: form.bio.trim(),
      };
      const response = await updateUserProfile(email, payload);
      const updated = extractOne(response);
      const nextProfile = updated
        ? { ...profile, ...normalizeProfile(updated), email: payload.email }
        : { ...profile, ...payload };

      setProfile(nextProfile);
      setForm(nextProfile);
      toast.success("Profile updated", {
        description: "Your community profile now reflects the latest changes.",
      });
    } catch (error) {
      toast.error("Could not update your profile", {
        description: error?.message || "Please try again in a moment.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-9 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]" aria-busy="true">
        <div className="h-96 animate-pulse rounded-2xl border border-line bg-surface-muted" />
        <div className="h-96 animate-pulse rounded-2xl border border-line bg-surface-muted" />
      </div>
    );
  }

  if (loadError) {
    return (
      <Card className="mt-9">
        <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Profile unavailable</h2>
            <p className="mt-1 max-w-md text-sm leading-6 text-muted" role="alert">
              {loadError}
            </p>
          </div>
          <Button onClick={loadProfile} variant="outline" className="mt-2">
            <RefreshCw aria-hidden="true" />
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-9 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="h-fit">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-white bg-surface-muted shadow-lg">
            <SafeImage
              key={profile.avatarUrl || AVATAR_FALLBACK}
              src={profile.avatarUrl}
              fallbackSrc={AVATAR_FALLBACK}
              alt={`${profile.name || "Volunteer"} profile avatar`}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <h2 className="mt-5 text-xl font-bold tracking-tight text-foreground">
            {profile.name}
          </h2>
          <p className="mt-1 text-sm font-medium text-primary">{profile.role}</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
            <Mail className="h-4 w-4" aria-hidden="true" />
            {profile.email}
          </p>
          <p className="mt-4 text-sm leading-6 text-muted">{profile.bio}</p>

          <div className="mt-6 grid w-full grid-cols-3 gap-3">
            <div className="rounded-2xl bg-primary-soft p-3">
              <p className="text-xl font-extrabold text-primary">{profile.contributions}</p>
              <p className="mt-1 text-xs font-medium text-muted">Contributions</p>
            </div>
            <div className="rounded-2xl bg-surface-muted p-3">
              <p className="text-xl font-extrabold text-foreground">{profile.volunteerHours}</p>
              <p className="mt-1 text-xs font-medium text-muted">Hours</p>
            </div>
            <div className="rounded-2xl bg-surface-muted p-3">
              <p className="text-xl font-extrabold text-foreground">{profile.impactPoints}</p>
              <p className="mt-1 text-xs font-medium text-muted">Points</p>
            </div>
          </div>

          <Badge className="mt-5">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
            ShomajSetu member
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-primary" aria-hidden="true" />
            Edit profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full name</Label>
              <Input
                id="profile-name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                disabled={saving}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              <FieldError id="name-error">{errors.name}</FieldError>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={form.email}
                readOnly
                className="bg-surface-muted"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              <p className="text-xs text-muted">
                Your account email identifies your volunteer profile.
              </p>
              <FieldError id="email-error">{errors.email}</FieldError>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-role">Role</Label>
              <Input
                id="profile-role"
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
                placeholder="e.g. Community Volunteer"
                disabled={saving}
                aria-invalid={Boolean(errors.role)}
                aria-describedby={errors.role ? "role-error" : undefined}
              />
              <FieldError id="role-error">{errors.role}</FieldError>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-bio">Bio</Label>
              <Textarea
                id="profile-bio"
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                placeholder="Tell your community what drives you."
                disabled={saving}
                aria-invalid={Boolean(errors.bio)}
                aria-describedby={errors.bio ? "bio-error" : undefined}
              />
              <FieldError id="bio-error">{errors.bio}</FieldError>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <Save aria-hidden="true" />
                )}
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForm(profile);
                  setErrors({});
                }}
                disabled={saving}
              >
                Discard
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
