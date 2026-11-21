import EventDetails from "@/src/components/EventDetails";

// Runtime `params` (and the Navbar's usePathname) need a blocking route.
export const instant = false;

export const metadata = {
  title: "Event Details",
  description: "Explore a ShomajSetu community drive and join as a volunteer.",
};

export default async function EventDetailsPage({ params }) {
  const { id } = await params;

  return (
    <div className="border-b border-line bg-surface-muted">
      <div className="shell-container py-12 lg:py-16">
        <p className="section-eyebrow">Community Drive</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Event details
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
          Review the plan, then reserve your spot with a signed-in volunteer account.
        </p>

        <EventDetails id={id} />
      </div>
    </div>
  );
}
