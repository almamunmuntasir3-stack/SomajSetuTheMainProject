import CreateEventForm from "@/src/components/CreateEventForm";
import ProtectedRoute from "@/src/components/ProtectedRoute";

export const metadata = {
  title: "Create Event",
  description: "Organize a community service drive and invite volunteers.",
};

export default function CreateEventPage() {
  return (
    <ProtectedRoute>
      <div className="border-b border-line bg-surface-muted">
        <div className="shell-container py-12 lg:py-16">
          <p className="section-eyebrow">Organize</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Create a community event
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            Share the details clearly so neighbors know how they can help. Every
            great drive starts with a simple invitation.
          </p>

          <CreateEventForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
