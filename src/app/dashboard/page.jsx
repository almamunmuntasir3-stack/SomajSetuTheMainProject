import DashboardContent from "@/src/components/DashboardContent";
import ProtectedRoute from "@/src/components/ProtectedRoute";

export const metadata = {
  title: "Volunteer Dashboard",
  description: "Your ShomajSetu volunteer impact at a glance.",
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="border-b border-line bg-surface-muted">
        <div className="shell-container py-12 lg:py-16">
          <DashboardContent />
        </div>
      </div>
    </ProtectedRoute>
  );
}
