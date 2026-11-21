"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarDays,
  ChevronDown,
  HandHeart,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  UserRound,
  UserPlus,
  X,
} from "lucide-react";
import ThemeToggle from "@/src/components/ThemeToggle";
import { signOut, useSession } from "@/src/lib/auth-client";

const eventLinks = [
  { href: "/events", label: "Upcoming Events" },
  { href: "/create-event", label: "Create Event" },
  { href: "/manage-events", label: "Manage Events" },
  { href: "/joined-events", label: "Joined Events" },
];

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClass(active) {
  return `flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
    active
      ? "bg-primary-soft text-primary shadow-sm"
      : "text-muted hover:bg-surface-muted hover:text-foreground"
  }`;
}

/** Compact account dropdown shared by the desktop and mobile avatar buttons. */
function AccountMenu({
  id,
  displayName,
  displayEmail,
  initial,
  profileActive,
  onNavigate,
  onSignOut,
}) {
  const linkClass = `flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
    profileActive
      ? "bg-primary-soft text-primary"
      : "text-muted hover:bg-surface-muted hover:text-foreground"
  }`;
  const buttonClass =
    "flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted transition-all duration-200 hover:bg-surface-muted hover:text-foreground";

  return (
    <div
      id={id}
      role="menu"
      aria-label="Account menu"
      className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-64 origin-top-right rounded-2xl border border-line bg-surface-raised p-2 shadow-xl"
    >
      <div className="flex items-center gap-3 px-2 pb-2 pt-1.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 via-brand-600 to-navy-800 text-base font-extrabold text-white shadow-sm">
          {initial}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-semibold text-foreground">
            {displayName}
          </span>
          <span className="block truncate text-xs text-muted">{displayEmail}</span>
        </span>
      </div>
      <div className="my-1 border-t border-line" />
      <Link
        href="/profile"
        role="menuitem"
        onClick={onNavigate}
        className={linkClass}
        aria-current={profileActive ? "page" : undefined}
      >
        <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
        Profile
      </Link>
      <button type="button" role="menuitem" onClick={onSignOut} className={buttonClass}>
        <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
        Sign Out
      </button>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [desktopEventsOpen, setDesktopEventsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileEventsOpen, setMobileEventsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const desktopEventsRef = useRef(null);
  const desktopTriggerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileTriggerRef = useRef(null);
  const desktopAccountRef = useRef(null);
  const desktopAccountTriggerRef = useRef(null);
  const mobileAccountRef = useRef(null);
  const mobileAccountTriggerRef = useRef(null);

  const eventsActive = eventLinks.some((link) => isActive(pathname, link.href));
  const profileActive = isActive(pathname, "/profile");
  const displayName = user?.name || "ShomajSetu User";
  const displayEmail = user?.email || "";
  const displaySource = (user?.name || user?.email || "U").trim();
  const initial = displaySource.charAt(0).toUpperCase();

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setMobileEventsOpen(false);
  }, []);

  const closeMenus = useCallback(() => {
    setDesktopEventsOpen(false);
    setAccountOpen(false);
    closeMobile();
  }, [closeMobile]);

  const toggleAccount = useCallback(() => {
    setDesktopEventsOpen(false);
    closeMobile();
    setAccountOpen((open) => !open);
  }, [closeMobile]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (
        desktopEventsRef.current &&
        !desktopEventsRef.current.contains(event.target)
      ) {
        setDesktopEventsOpen(false);
      }

      if (
        mobileOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        mobileTriggerRef.current &&
        !mobileTriggerRef.current.contains(event.target)
      ) {
        closeMobile();
      }

      if (
        accountOpen &&
        !desktopAccountRef.current?.contains(event.target) &&
        !mobileAccountRef.current?.contains(event.target)
      ) {
        setAccountOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key !== "Escape") return;

      if (desktopEventsOpen) desktopTriggerRef.current?.focus();
      if (mobileOpen) mobileTriggerRef.current?.focus();
      if (accountOpen) {
        const trigger = desktopAccountTriggerRef.current?.offsetParent
          ? desktopAccountTriggerRef.current
          : mobileAccountTriggerRef.current;
        trigger?.focus();
      }
      closeMenus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [desktopEventsOpen, mobileOpen, accountOpen, closeMenus, closeMobile]);

  async function handleSignOut() {
    closeMenus();

    try {
      await signOut();
      toast.success("Signed out", {
        description: "You have been signed out of ShomajSetu.",
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(error?.message || "Unable to sign out. Please try again.");
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-surface/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-surface/75">
      <div className="shell-container">
        <div className="flex h-16 items-center justify-between gap-3 lg:h-[4.5rem]">
          <Link
            href="/"
            onClick={closeMenus}
            className="group flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:outline-none"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-navy-800 text-white shadow-sm transition duration-200 group-hover:scale-[1.03] group-hover:shadow-md">
              <HandHeart className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-base font-extrabold tracking-tight text-foreground">
                ShomajSetu
              </span>
              <span className="hidden truncate text-[11px] font-medium text-muted sm:block">
                Together We Create a Better Tomorrow
              </span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              onClick={closeMenus}
              className={navLinkClass(isActive(pathname, "/"))}
              aria-current={isActive(pathname, "/") ? "page" : undefined}
            >
              Home
            </Link>

            <div ref={desktopEventsRef} className="relative">
              <button
                ref={desktopTriggerRef}
                type="button"
                onClick={() => {
                  setDesktopEventsOpen((open) => !open);
                  setMobileEventsOpen(false);
                }}
                className={`${navLinkClass(eventsActive)} cursor-pointer`}
                aria-expanded={desktopEventsOpen}
                aria-haspopup="menu"
                aria-controls="desktop-events-menu"
                aria-current={eventsActive ? "page" : undefined}
              >
                Events
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    desktopEventsOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {desktopEventsOpen ? (
                <div
                  id="desktop-events-menu"
                  role="menu"
                  aria-label="Events"
                  className="absolute left-0 top-[calc(100%+0.65rem)] z-50 w-60 origin-top-left rounded-2xl border border-line bg-surface-raised p-2 shadow-xl transition-all duration-200"
                >
                  <p className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                    Explore Events
                  </p>
                  {eventLinks.map((link) => {
                    const active = isActive(pathname, link.href);

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        role="menuitem"
                        onClick={closeMenus}
                        className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          active
                            ? "bg-primary-soft text-primary"
                            : "text-muted hover:bg-surface-muted hover:text-foreground"
                        }`}
                        aria-current={active ? "page" : undefined}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <Link
              href="/dashboard"
              onClick={closeMenus}
              className={navLinkClass(isActive(pathname, "/dashboard"))}
              aria-current={isActive(pathname, "/dashboard") ? "page" : undefined}
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              Dashboard
            </Link>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />

            {isPending ? (
              <span className="px-2 text-sm text-muted">Loading…</span>
            ) : user ? (
              <div ref={desktopAccountRef} className="relative">
                <button
                  ref={desktopAccountTriggerRef}
                  type="button"
                  onClick={toggleAccount}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-brand-500 via-brand-600 to-navy-800 text-sm font-extrabold text-white shadow-sm transition duration-200 hover:scale-105 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  aria-label="Open account menu"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  aria-controls="desktop-account-menu"
                >
                  {initial}
                </button>

                {accountOpen ? (
                  <AccountMenu
                    id="desktop-account-menu"
                    displayName={displayName}
                    displayEmail={displayEmail}
                    initial={initial}
                    profileActive={profileActive}
                    onNavigate={closeMenus}
                    onSignOut={handleSignOut}
                  />
                ) : null}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMenus}
                  className="btn btn-outline px-4 py-2 text-sm"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenus}
                  className="btn btn-primary px-4 py-2 text-sm"
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            {user ? (
              <div ref={mobileAccountRef} className="relative">
                <button
                  ref={mobileAccountTriggerRef}
                  type="button"
                  onClick={toggleAccount}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-brand-500 via-brand-600 to-navy-800 text-sm font-extrabold text-white shadow-sm transition duration-200 hover:scale-105 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  aria-label="Open account menu"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  aria-controls="mobile-account-menu"
                >
                  {initial}
                </button>

                {accountOpen ? (
                  <AccountMenu
                    id="mobile-account-menu"
                    displayName={displayName}
                    displayEmail={displayEmail}
                    initial={initial}
                    profileActive={profileActive}
                    onNavigate={closeMenus}
                    onSignOut={handleSignOut}
                  />
                ) : null}
              </div>
            ) : null}
            <button
              ref={mobileTriggerRef}
              type="button"
              className="icon-button"
              onClick={() => {
                setDesktopEventsOpen(false);
                setMobileOpen((open) => !open);
              }}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div
            id="mobile-menu"
            ref={mobileMenuRef}
            className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line pb-5 pt-3 lg:hidden"
          >
            <p className="px-2 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted sm:hidden">
              Together We Create a Better Tomorrow
            </p>

            <nav aria-label="Mobile primary" className="grid gap-1">
              <Link
                href="/"
                onClick={closeMenus}
                className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive(pathname, "/")
                    ? "bg-primary-soft text-primary"
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
                aria-current={isActive(pathname, "/") ? "page" : undefined}
              >
                <Home className="mr-2.5 h-4 w-4 shrink-0" aria-hidden="true" />
                Home
              </Link>

              <div className="overflow-hidden rounded-xl">
                <button
                  type="button"
                  onClick={() => setMobileEventsOpen((open) => !open)}
                  className={`flex w-full cursor-pointer items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                    eventsActive
                      ? "bg-primary-soft text-primary"
                      : "text-muted hover:bg-surface-muted hover:text-foreground"
                  }`}
                  aria-expanded={mobileEventsOpen}
                  aria-controls="mobile-events-menu"
                  aria-current={eventsActive ? "page" : undefined}
                >
                  <CalendarDays
                    className="mr-2.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="flex-1">Events</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                      mobileEventsOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {mobileEventsOpen ? (
                  <div
                    id="mobile-events-menu"
                    className="ml-5 mt-1 grid gap-0.5 border-l border-line pl-3"
                  >
                    {eventLinks.map((link) => {
                      const active = isActive(pathname, link.href);

                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={closeMenus}
                          className={`rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                            active
                              ? "bg-primary-soft font-semibold text-primary"
                              : "text-muted hover:bg-surface-muted hover:text-foreground"
                          }`}
                          aria-current={active ? "page" : undefined}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <Link
                href="/dashboard"
                onClick={closeMenus}
                className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive(pathname, "/dashboard")
                    ? "bg-primary-soft text-primary"
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
                aria-current={
                  isActive(pathname, "/dashboard") ? "page" : undefined
                }
              >
                <LayoutDashboard
                  className="mr-2.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                Dashboard
              </Link>
            </nav>

            {isPending ? (
              <div className="mt-4 border-t border-line pt-4">
                <div className="flex items-center gap-3 px-2">
                  <span className="h-10 w-10 animate-pulse rounded-full bg-surface-muted" />
                  <span className="grid flex-1 gap-2">
                    <span className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
                    <span className="h-2.5 w-36 animate-pulse rounded bg-surface-muted" />
                  </span>
                </div>
              </div>
            ) : user ? null : (
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line px-2 pt-4">
                <Link
                  href="/login"
                  onClick={closeMenus}
                  className="btn btn-outline w-full px-4 py-2.5 text-sm"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenus}
                  className="btn btn-primary w-full px-4 py-2.5 text-sm"
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Register
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
