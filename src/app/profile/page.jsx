import ProfileForm from "@/src/components/ProfileForm";
import ProtectedRoute from "@/src/components/ProtectedRoute";

export const metadata = {
  title: "My Profile",
  description: "View and update your ShomajSetu volunteer profile.",
};

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="border-b border-line bg-surface-muted">
        <div className="shell-container py-12 lg:py-16">
          <p className="section-eyebrow">Your Profile</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Community profile
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            Keep your details current so fellow volunteers and organizers know who
            is showing up to make a difference.
          </p>

          <ProfileForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
