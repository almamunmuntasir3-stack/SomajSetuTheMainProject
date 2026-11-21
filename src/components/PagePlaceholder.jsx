import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PagePlaceholder({ eyebrow, title, description, icon: Icon }) {
  return (
    <div className="border-b border-line bg-surface-muted">
      <div className="shell-container py-16 lg:py-20">
        <div className="card max-w-3xl p-7 sm:p-10">
          {Icon ? (
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
          ) : null}
          <p className="section-eyebrow mt-5">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            {description}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/events" className="btn btn-primary">
              Browse upcoming events
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/" className="btn btn-outline">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
