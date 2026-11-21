import { Compass, Handshake, CalendarClock, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

const pillars = [
  {
    icon: Compass,
    title: "Discover Local Drives",
    description:
      "Find service opportunities near you by cause, location, and date — from riverbank cleanups to reading circles.",
  },
  {
    icon: Handshake,
    title: "Host Community Events",
    description:
      "Share a clear plan, set volunteer targets, and gather the right hands for an initiative your neighborhood needs.",
  },
  {
    icon: CalendarClock,
    title: "Track Volunteer Hours & Impact",
    description:
      "Record participation and hours in one place so every contribution is visible, measurable, and worth celebrating.",
  },
  {
    icon: ShieldCheck,
    title: "Collaborate Safely",
    description:
      "Coordinate with trusted local organizers, transparent details, and respectful, dignity-first community practices.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="shell-container py-16 lg:py-20">
      <div className="max-w-2xl">
        <p className="section-eyebrow">Why ShomajSetu</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Four pillars for meaningful local action
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
          Everything an organizer or volunteer needs to move from good intent
          to real, accountable impact.
        </p>
      </div>

      <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {pillars.map(({ icon: Icon, title, description }) => (
          <Card
            key={title}
            className="group h-full transition duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl"
          >
            <CardHeader>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary transition group-hover:scale-105">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <CardTitle className="mt-3">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
