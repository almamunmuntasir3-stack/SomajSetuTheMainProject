"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useSession } from "@/src/lib/auth-client";

function SessionSkeleton() {
  return (
    <div
      className="border-b border-line bg-surface"
      role="status"
      aria-live="polite"
    >
      <div className="shell-container py-14 lg:py-16">
        <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
        <div className="mt-4 h-9 w-2/3 max-w-xl animate-pulse rounded bg-surface-muted" />
        <div className="mt-3 h-5 w-full max-w-2xl animate-pulse rounded bg-surface-muted" />
        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-2xl border border-line bg-surface-muted"
            />
          ))}
        </div>
        <span className="sr-only">Checking your session…</span>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const isAuthenticated = Boolean(session?.user);

  useEffect(() => {
    // Wait for Better Auth to finish restoring the session before deciding;
    // a page reload must not bounce a valid user to /login.
    if (isPending || isAuthenticated) return;

    const search = typeof window === "undefined" ? "" : window.location.search;
    const intendedPath = `${pathname}${search}`;
    router.replace(`/login?redirect=${encodeURIComponent(intendedPath)}`);
  }, [isAuthenticated, isPending, pathname, router]);

  if (isPending) return <SessionSkeleton />;
  if (!isAuthenticated) return <SessionSkeleton />;

  return children;
}
