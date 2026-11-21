import Link from "next/link";
import { ArrowRight, CalendarCheck2, HeartHandshake, UsersRound } from "lucide-react";

import SafeImage from "@/src/components/SafeImage";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { HERO_IMAGE } from "@/src/lib/eventImages";

const impactStats = [
  { icon: UsersRound, value: "1,800+", label: "Active volunteers" },
  { icon: HeartHandshake, value: "240", label: "Completed drives" },
  { icon: CalendarCheck2, value: "32", label: "Upcoming initiatives" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-surface-muted">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(10,31,51,0.12),transparent_32%)]" />

      <div className="shell-container relative grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <div>
          <Badge className="mb-5">
            ShomajSetu Community Platform
          </Badge>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Small actions.{" "}
            <span className="text-primary">Real change</span> in every
            neighborhood.
          </h1>

          <p className="mt-4 text-lg font-semibold text-navy-700 dark:text-brand-300">
            Together We Create a Better Tomorrow
          </p>

          <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            ShomajSetu connects neighbors across Bangladesh to clean our
            waterways, plant our streets, care for our families, and learn
            together — one practical community drive at a time.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="default">
              <Link href="/events">
                Explore Events
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="navy">
              <Link href="/create-event">Start an Initiative</Link>
            </Button>
          </div>

          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-3 sm:gap-4">
            {impactStats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="rounded-2xl border border-line bg-surface-raised/80 p-4"
              >
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <dd className="mt-2 text-2xl font-bold text-foreground">{value}</dd>
                <dt className="mt-1 text-xs font-medium leading-4 text-muted">
                  {label}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        <Card className="overflow-hidden p-3 shadow-xl">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-navy-900">
            <SafeImage
              src={HERO_IMAGE}
              alt="Community volunteers working side by side on a local service drive"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur">
              <p className="text-sm font-semibold">Neighbors in action</p>
              <p className="mt-1 text-sm text-white/85">
                Students, families, and local groups turning shared purpose
                into visible change.
              </p>
            </div>
          </div>
          <CardContent className="flex items-center justify-between gap-4 px-3 pb-1 pt-4">
            <p className="text-sm font-medium text-foreground">
              Built for Bangladesh, by its communities.
            </p>
            <Badge variant="default" className="shrink-0">Since 2024</Badge>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
