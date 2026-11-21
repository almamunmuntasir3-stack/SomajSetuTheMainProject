import { extractImageUrl, safeImageUrl } from "@/src/lib/eventImages";

const CATEGORY_GROUPS = {
  Environment: "Environment",
  "Tree Plantation": "Environment",
  "Health Camp": "Health",
  "Winter Cloth Drive": "Relief",
  "Youth Literacy Workshop": "Education",
};

// The Express join route stores values like "email:user@example.com" in
// joinedVolunteers. Strip known labels before comparing with session identity.
const IDENTITY_PREFIXES = ["email:", "useremail:", "userid:", "user:", "id:"];

function normalizeIdentity(value) {
  let text = String(value ?? "").trim();
  const lower = text.toLowerCase();

  for (const prefix of IDENTITY_PREFIXES) {
    if (lower.startsWith(prefix)) {
      text = text.slice(prefix.length).trim();
      break;
    }
  }

  return text.toLowerCase();
}

function pick(source, keys) {
  if (!source || typeof source !== "object") return undefined;

  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }

  return undefined;
}

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function firstArray(source, keys) {
  if (!source || typeof source !== "object") return [];

  for (const key of keys) {
    if (Array.isArray(source[key])) return source[key];
  }

  return [];
}

/** Accepts arrays and common API envelopes such as { events: [...] }. */
export function extractList(payload, depth = 0) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object" || depth > 3) return [];

  for (const key of ["events", "data", "results", "items", "joinedEvents"]) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      const nested = extractList(value, depth + 1);
      if (nested.length > 0) return nested;
    }
  }

  return [];
}

/** Accepts a bare object or envelopes such as { event: {...} }, { data: {...} }. */
export function extractOne(payload, depth = 0) {
  if (!payload || typeof payload !== "object") return null;
  if (Array.isArray(payload)) return payload[0] ?? null;
  if (depth > 3) return payload;

  for (const key of ["event", "profile", "user", "data", "result", "document"]) {
    const value = payload[key];
    if (Array.isArray(value)) {
      if (value[0] && typeof value[0] === "object") return value[0];
      continue;
    }
    if (value && typeof value === "object") return value;
  }

  return payload;
}

export function formatEventDate(value) {
  if (!value) return "Date to be announced";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const part = (type) => parts.find((item) => item.type === type)?.value ?? "";
  const period = part("dayPeriod").toUpperCase();

  return `${part("weekday")}, ${part("day")} ${part("month")} ${part("year")} • ${part("hour")}:${part("minute")}${period ? ` ${period}` : ""}`;
}

/** Drops events whose date has passed; undated records stay visible. */
export function isUpcomingEvent(event) {
  const raw = event?.eventDate ?? event?.raw?.eventDate;
  if (!raw) return true;

  const timestamp = new Date(raw).getTime();
  if (!Number.isFinite(timestamp)) return true;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return timestamp >= startOfToday.getTime();
}

function joinedEmailsFrom(source) {
  const entries = firstArray(source, [
    "volunteers",
    "joinedVolunteers",
    "registeredUsers",
    "joinedUsers",
    "participants",
    "attendees",
  ]);

  return entries
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (!entry || typeof entry !== "object") return null;

      const direct = pick(entry, ["email", "userEmail"]);
      if (direct) return direct;

      if (entry.user && typeof entry.user === "object") {
        return pick(entry.user, ["email", "id", "_id"]);
      }

      return pick(entry, ["id", "_id", "userId"]);
    })
    .map((value) => normalizeIdentity(value))
    .filter(Boolean);
}

export function normalizeEvent(raw) {
  const source = extractOne(raw) ?? {};
  const organizer = source.organizer && typeof source.organizer === "object" ? source.organizer : null;

  const id = pick(source, ["id", "_id", "eventId", "event_id"]);
  const category = String(
    pick(source, ["category", "categoryName", "eventCategory", "type"]) ?? "Community"
  );
  const eventDate = pick(source, [
    "eventDate",
    "date",
    "event_date",
    "startDate",
    "startsAt",
    "datetime",
  ]);
  const organizerEmail = pick(source, [
    "organizerEmail",
    "organizer_email",
    "createdByEmail",
    "userEmail",
    "email",
  ]) ?? (organizer ? pick(organizer, ["email", "userEmail"]) : undefined);
  const maxVolunteers = asNumber(
    pick(source, [
      "maxVolunteers",
      "volunteersNeeded",
      "capacity",
      "slots",
      "targetVolunteers",
      "max_volunteers",
    ]),
    0
  );
  const joinedEmails = joinedEmailsFrom(source);
  const currentVolunteers = asNumber(
    pick(source, [
      "currentVolunteers",
      "registered",
      "volunteerCount",
      "joinedCount",
      "joinedVolunteersCount",
    ]),
    joinedEmails.length
  );

  return {
    id: String(id ?? source.title ?? ""),
    raw: source,
    title: String(pick(source, ["title", "name", "eventTitle"]) ?? "Untitled event"),
    description: String(pick(source, ["description", "details", "about"]) ?? ""),
    location: String(pick(source, ["location", "venue", "address"]) ?? "Location to be announced"),
    category,
    categoryGroup:
      String(pick(source, ["categoryGroup"]) ?? CATEGORY_GROUPS[category] ?? "Community"),
    eventDate: eventDate ? String(eventDate) : "",
    dateLabel: String(pick(source, ["dateLabel", "date_label", "formattedDate"]) ?? formatEventDate(eventDate)),
    imageUrl: safeImageUrl(extractImageUrl(source)),
    organizer: String(
      pick(source, ["organizer", "organizerName", "organizer_name", "host"]) ??
        organizerEmail ??
        "Community organizer"
    ),
    organizerEmail: organizerEmail ? String(organizerEmail) : "",
    maxVolunteers,
    volunteersNeeded: maxVolunteers,
    currentVolunteers,
    registered: currentVolunteers,
    status: String(pick(source, ["status", "state"]) ?? "Published"),
    joinedEmails,
  };
}

export function normalizeProfile(raw) {
  const source = extractOne(raw) ?? {};
  const email = pick(source, ["email", "userEmail"]);

  return {
    name: String(pick(source, ["name", "fullName", "displayName"]) ?? ""),
    email: email ? String(email) : "",
    role: String(pick(source, ["role", "occupation", "title"]) ?? "Community Volunteer"),
    bio: String(pick(source, ["bio", "about", "description"]) ?? ""),
    avatarUrl: safeImageUrl(
      extractImageUrl(source) || pick(source, ["avatarUrl", "photoURL", "avatar", "profileImage"])
    ),
    volunteerHours: asNumber(pick(source, ["volunteerHours", "hours", "totalHours"]), 0),
    impactPoints: asNumber(pick(source, ["impactPoints", "points"]), 0),
    contributions: asNumber(pick(source, ["contributions", "eventsJoined"]), 0),
  };
}

export function normalizeActivity(raw, index = 0) {
  const source = extractOne(raw) ?? {};

  return {
    id: String(pick(source, ["id", "_id"]) ?? index),
    title: String(pick(source, ["title", "action", "name"]) ?? "Community activity"),
    detail: String(pick(source, ["detail", "description", "message"]) ?? ""),
    when: String(pick(source, ["when", "timeAgo", "createdAt", "timestamp", "date"]) ?? ""),
    type: String(pick(source, ["type", "kind"]) ?? "activity"),
  };
}

export function isOwnedBy(event, user) {
  if (!event || !user) return false;

  const email = String(user.email ?? "").trim().toLowerCase();
  const organizerEmail = String(event.organizerEmail ?? "").trim().toLowerCase();
  if (email && organizerEmail === email) return true;

  const name = String(user.name ?? "").trim().toLowerCase();
  const organizer = String(event.organizer ?? "").trim().toLowerCase();
  return Boolean(name && organizer && organizer.includes(name));
}

export function hasJoined(event, user) {
  if (!event || !user) return false;
  if (event.raw?.joined === true) return true;

  const email = normalizeIdentity(user.email);
  const id = normalizeIdentity(user.id ?? user._id);

  return (event.joinedEmails ?? []).some((entry) => {
    const value = normalizeIdentity(entry);
    return Boolean((email && value === email) || (id && value === id));
  });
}
