"use client";

import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterSection() {
  const [email, setEmail] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      toast.error("Please enter a valid email address", {
        description: "Use a format like name@example.com.",
      });
      return;
    }

    toast.success("You're on the list!", {
      description: "We'll send upcoming drives and community stories to " + value + ".",
    });
    setEmail("");
  }

  return (
    <section className="shell-container pb-16 lg:pb-20">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary-soft via-surface-raised to-surface-muted">
        <CardContent className="grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-12">
          <div>
            <p className="section-eyebrow">Stay in the loop</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Good news, delivered to your inbox.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base">
              Get a short monthly note with new volunteer opportunities,
              impact updates, and stories from communities across Bangladesh.
              No noise, just ways to help.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="w-full">
            <label
              htmlFor="newsletter-email"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Email address
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <Input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-9"
                  aria-describedby="newsletter-hint"
                />
              </div>
              <Button type="submit" variant="default">
                Subscribe
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
            <p id="newsletter-hint" className="mt-2 text-xs text-muted">
              We only share community updates. Unsubscribe whenever you like.
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
