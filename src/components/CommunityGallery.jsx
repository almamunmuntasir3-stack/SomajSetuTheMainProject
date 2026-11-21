import { Sprout, Sparkles, Stethoscope, Trash2 } from "lucide-react";

import SafeImage from "@/src/components/SafeImage";
import { Badge } from "@/src/components/ui/badge";
import { GALLERY_IMAGES } from "@/src/lib/eventImages";

const moments = [
  {
    icon: Sprout,
    caption: "Native saplings take root at a neighborhood plantation drive.",
    location: "Ramna Park, Dhaka",
    image: GALLERY_IMAGES[0],
    className: "md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto md:min-h-[26rem]",
  },
  {
    icon: Trash2,
    caption: "Riverbank volunteers sorting waste during a cleanup morning.",
    location: "Buriganga, Old Dhaka",
    image: GALLERY_IMAGES[1],
    className: "aspect-[4/3]",
  },
  {
    icon: Sparkles,
    caption: "Reading circles opening new doors for local students.",
    location: "Rajshahi community library",
    image: GALLERY_IMAGES[2],
    className: "aspect-[4/3]",
  },
  {
    icon: Stethoscope,
    caption: "Free health camps bringing essential care closer to families.",
    location: "Mirpur, Dhaka",
    image: GALLERY_IMAGES[3],
    className: "aspect-[4/3] md:col-span-2",
  },
];

export default function CommunityGallery() {
  return (
    <section className="shell-container py-16 lg:py-20">
      <div className="max-w-2xl">
        <p className="section-eyebrow">Community Gallery</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Moments that show what together can do
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
          Real scenes from the drives, workshops, and care our communities
          organize every season.
        </p>
      </div>

      <div className="mt-9 grid auto-rows-auto gap-4 md:grid-cols-3">
        {moments.map(({ icon: Icon, caption, location, image: cover, className }) => (
          <figure
            key={caption}
            className={`group relative overflow-hidden rounded-2xl border border-line bg-navy-900 ${className}`}
          >
            <SafeImage
              src={cover.src}
              alt={cover.alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent transition group-hover:from-navy-950/90" />
            <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white">
              <Badge
                variant="outline"
                className="mb-2 border-white/25 bg-white/10 text-white"
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {location}
              </Badge>
              <p className="text-sm font-medium leading-6 sm:text-base">{caption}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
