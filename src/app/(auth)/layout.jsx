import { HeartHandshake, ShieldCheck, Sparkles, Users } from "lucide-react";

export const metadata = {
  title: "Account",
  description: "Sign in or register to take part in ShomajSetu community drives.",
};

const highlights = [
  {
    icon: Users,
    title: "Find your people",
    text: "Join local volunteers working on causes close to home.",
  },
  {
    icon: HeartHandshake,
    title: "Serve with purpose",
    text: "Turn a free morning into measurable community impact.",
  },
  {
    icon: ShieldCheck,
    title: "Trust every drive",
    text: "Clear event details help you show up prepared.",
  },
];

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center border-b border-line bg-surface-muted py-10 sm:py-14">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-line bg-surface shadow-[var(--shadow-card)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-navy-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-brand-400/15 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 text-navy-950">
                <HeartHandshake className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">ShomajSetu</span>
            </div>
            <h2 className="mt-12 text-4xl font-bold leading-tight tracking-tight">
              Small actions.
              <br />
              <span className="text-brand-300">Shared strength.</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
              One place to discover drives, organize neighbors, and celebrate the
              change we create together.
            </p>
          </div>

          <ul className="relative mt-12 space-y-5">
            {highlights.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-300">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-white/60">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="relative mt-12 flex items-center gap-2 text-xs text-white/50">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Built for communities across Bangladesh
          </p>
        </aside>

        <div className="p-7 sm:p-10 lg:p-12">{children}</div>
      </div>
    </div>
  );
}
