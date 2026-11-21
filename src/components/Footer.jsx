import Link from "next/link";
import {
  HandHeart,
  Mail,
  MapPin,
  Phone,
  CalendarHeart,
  HeartHandshake,
} from "lucide-react";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Upcoming Events" },
  { href: "/create-event", label: "Create Event" },
  { href: "/manage-events", label: "Manage Events" },
  { href: "/joined-events", label: "Joined Events" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "My Profile" },
];

const focusAreas = [
  "River & canal restoration",
  "Urban and rural tree plantation",
  "Community health outreach",
  "Seasonal relief and dignity drives",
  "Youth learning and mentorship",
];

const COPYRIGHT_YEAR = 2026;

export default function Footer() {
  return (
    <footer className="border-t border-line bg-navy-950 text-slate-200">
      <div className="shell-container py-12 lg:py-14">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-navy-950">
                <HandHeart className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-lg font-extrabold tracking-tight text-white">
                  ShomajSetu
                </span>
                <span className="block text-xs text-slate-400">
                  Together We Create a Better Tomorrow
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
              ShomajSetu is a community bridge that helps people across
              Bangladesh discover, organize, and join service initiatives that
              protect nature, uplift families, and strengthen neighborhoods.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-brand-300">
              <HeartHandshake className="h-4 w-4" aria-hidden="true" />
              Service rooted in care and collaboration
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h2>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-300 transition hover:text-brand-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  className="text-sm text-slate-300 transition hover:text-brand-300"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-slate-300 transition hover:text-brand-300"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Our Mission
            </h2>
            <ul className="mt-4 space-y-3">
              {focusAreas.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <CalendarHeart
                    className="mt-0.5 h-4 w-4 shrink-0 text-brand-400"
                    aria-hidden="true"
                  />
                  <span className="text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand-400"
                  aria-hidden="true"
                />
                <span>
                  House 12, Road 7, Dhanmondi
                  <br />
                  Dhaka 1205, Bangladesh
                </span>
              </li>
              <li>
                <a
                  href="mailto:hello@shomajsetu.org"
                  className="inline-flex items-center gap-2.5 transition hover:text-brand-300"
                >
                  <Mail className="h-4 w-4 text-brand-400" aria-hidden="true" />
                  hello@shomajsetu.org
                </a>
              </li>
              <li>
                <a
                  href="tel:+8801712345678"
                  className="inline-flex items-center gap-2.5 transition hover:text-brand-300"
                >
                  <Phone className="h-4 w-4 text-brand-400" aria-hidden="true" />
                  +880 1712-345678
                </a>
              </li>
            </ul>
            <p className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
              Have an idea for local impact? Start a drive, gather your
              neighbors, and let ShomajSetu help you connect the right hands and
              hearts.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {COPYRIGHT_YEAR} ShomajSetu. All rights reserved.</p>
          <p className="font-medium text-brand-300">
            Together We Create a Better Tomorrow
          </p>
        </div>
      </div>
    </footer>
  );
}
