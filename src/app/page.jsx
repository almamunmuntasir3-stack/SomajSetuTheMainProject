import HeroSection from "@/src/components/HeroSection";
import FeaturesSection from "@/src/components/FeaturesSection";
import UpcomingEventsSection from "@/src/components/UpcomingEventsSection";
import CommunityGallery from "@/src/components/CommunityGallery";
import NewsletterSection from "@/src/components/NewsletterSection";

export default function HomePage() {
  return (
    <div className="bg-surface">
      <HeroSection />
      <FeaturesSection />
      <UpcomingEventsSection />
      <CommunityGallery />
      <NewsletterSection />
    </div>
  );
}
