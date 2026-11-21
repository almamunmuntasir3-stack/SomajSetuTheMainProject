import ManageEventsList from "@/src/components/ManageEventsList";
import ProtectedRoute from "@/src/components/ProtectedRoute";

export const metadata = {
  title: "Manage Events",
  description: "Edit and manage the community events you have created.",
};

export default function ManageEventsPage() {
  return (
    <ProtectedRoute>
      <div className="border-b border-line bg-surface-muted">
        <div className="shell-container py-12 lg:py-16">
          <p className="section-eyebrow">Organizer Tools</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Manage your events
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            Keep your listings accurate and up to date. Edit details, review
            volunteer interest, or remove a drive that is no longer running.
          </p>

          <ManageEventsList />
        </div>
      </div>
    </ProtectedRoute>
  );
}
