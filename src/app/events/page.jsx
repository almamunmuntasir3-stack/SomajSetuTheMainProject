import EventsExplorer from "@/src/components/EventsExplorer";

export const metadata = {
  title: "Upcoming Events",
  description:
    "Browse upcoming community service drives across Bangladesh and find one to join.",
};

const categories = [
  "Environment",
  "Tree Plantation",
  "Health Camp",
  "Winter Cloth Drive",
  "Youth Literacy Workshop",
];

export default function EventsPage() {
  return (
    <div className="border-b border-line bg-surface-muted">
      <div className="shell-container py-14 lg:py-16">
        <p className="section-eyebrow">Community Calendar</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Upcoming Events
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
          Find a local initiative that fits your time and interests. Every pair
          of hands makes a measurable difference for the neighborhood.
        </p>

        <EventsExplorer categories={categories} />
      </div>
    </div>
  );
}
