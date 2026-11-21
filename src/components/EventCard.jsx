import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";

import SafeImage from "@/src/components/SafeImage";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

export default function EventCard({ event }) {
  return (
    <Card id={event.id} className="group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-52 overflow-hidden">
        <SafeImage
          key={event.imageUrl}
          src={event.imageUrl}
          alt={event.title}
          fill
          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4">
          <Badge variant="outline" className="shadow-sm">
            {event.category}
          </Badge>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-snug text-foreground">
          {event.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
          {event.description}
        </p>

        <dl className="mt-4 space-y-2 text-sm text-muted">
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
            <dd>{event.volunteersNeeded} volunteer spots</dd>
          </div>
        </dl>

        <Button asChild variant="link" className="mt-5 h-auto self-start p-0">
          <Link href={`/events/${event.id}`}>
            View Details
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
