"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

import FieldError from "@/src/components/FieldError";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { signIn } from "@/src/lib/auth-client";

function validate(values) {
  const errors = {};

  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "Enter a valid email address.";

  if (!values.password) errors.password = "Enter your password.";
  else if (values.password.length < 8)
    errors.password = "Passwords are at least 8 characters.";

  return errors;
}

function errorMessage(error) {
  return error?.message || "Something went wrong. Please try again.";
}

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      toast.error("Check your sign-in details");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signIn.email({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) {
        toast.error(errorMessage(error));
        return;
      }

      toast.success("Welcome back", {
        description: "You are signed in to your ShomajSetu account.",
      });

      const redirect = new URLSearchParams(window.location.search).get("redirect");
      const destination =
        redirect && redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : "/dashboard";
      router.push(destination);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <p className="section-eyebrow">Welcome back</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
        Sign in to ShomajSetu
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Pick up where your community service left off.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              className="pl-9"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              disabled={isSubmitting}
            />
          </div>
          <FieldError id="login-email-error">{errors.email}</FieldError>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="login-password">Password</Label>
            <span className="text-xs font-medium text-muted">
              Email &amp; password
            </span>
          </div>
          <div className="relative">
            <LockKeyhole
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="Enter your password"
              className="px-9"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "login-password-error" : undefined}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <FieldError id="login-password-error">{errors.password}</FieldError>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
          {!isSubmitting ? <ArrowRight aria-hidden="true" /> : null}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New to ShomajSetu?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
