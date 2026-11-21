import { getAuthToken } from "@/src/lib/auth-client";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
  /\/+$/,
  ""
);

function errorMessage(payload, response) {
  if (typeof payload === "string" && payload.trim()) return payload;

  if (payload && typeof payload === "object") {
    const candidate =
      payload.message || payload.error?.message || payload.error || payload.msg;
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }

  return response.statusText || `Request failed with status ${response.status}`;
}

function isNotFound(error) {
  return /\(404\)/.test(error?.message ?? "");
}

async function withFallback(primary, fallback) {
  try {
    return await primary();
  } catch (error) {
    if (isNotFound(error)) return fallback();
    throw error;
  }
}

/**
 * Fetch wrapper for the Express API. Attaches the Better Auth JWT when a
 * session exists, parses JSON, and throws readable errors for non-2xx replies.
 */
export async function apiFetch(path, options = {}) {
  const {
    method = "GET",
    body,
    headers: customHeaders,
    token: providedToken,
    ...rest
  } = options;
  const headers = new Headers(customHeaders);

  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  // Callers that already resolved the session token can pass it in to avoid a
  // second auth round-trip. `undefined` keeps the default lazy lookup.
  const token = providedToken !== undefined ? providedToken : await getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let serializedBody;
  if (body !== undefined && body !== null) {
    serializedBody = typeof body === "string" ? body : JSON.stringify(body);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: serializedBody,
      ...rest,
    });
  } catch (error) {
    throw new Error(error?.message || "Unable to reach the ShomajSetu API.");
  }

  let payload = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    throw new Error(`${errorMessage(payload, response)} (${response.status})`);
  }

  return payload;
}

export function getLatestEvents() {
  return apiFetch("/api/events/latest");
}

export function getUpcomingEvents({ search, category, organizer, joinedBy, token } = {}) {
  const params = new URLSearchParams();

  if (search) params.set("search", String(search).trim());
  if (category) params.set("category", String(category));
  if (organizer) params.set("organizer", String(organizer));
  if (joinedBy) params.set("joinedBy", String(joinedBy).trim().toLowerCase());

  const query = params.toString();
  return apiFetch(`/api/events/upcoming${query ? `?${query}` : ""}`, { token });
}

export function getEventById(id) {
  return apiFetch(`/api/events/${encodeURIComponent(id)}`);
}

/** Prefers a dedicated organizer endpoint; falls back to filtered upcoming events. */
export function getOrganizerEvents(email) {
  return withFallback(
    () => apiFetch(`/api/events/organizer/${encodeURIComponent(email)}`),
    () => getUpcomingEvents({ organizer: email })
  );
}

/**
 * Fetches events whose `joinedVolunteers` array contains this email.
 * The Express `/api/events/upcoming?joinedBy=` endpoint queries that exact
 * field and returns a bare array, so it is the primary request. A dedicated
 * user endpoint remains a fallback for deployments that provide one.
 */
export function getJoinedEvents(email, token) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  if (!normalizedEmail) return Promise.resolve([]);

  return withFallback(
    () => getUpcomingEvents({ joinedBy: normalizedEmail, token }),
    () =>
      apiFetch(
        `/api/users/${encodeURIComponent(normalizedEmail)}/joined-events`,
        { token }
      )
  );
}

/** Returns null when the backend has no dedicated dashboard endpoint. */
export function getDashboardData(email) {
  return withFallback(
    () => apiFetch(`/api/users/${encodeURIComponent(email)}/dashboard`),
    () => null
  );
}

export function createEvent(payload) {
  return apiFetch("/api/events", { method: "POST", body: payload });
}

export function updateEvent(id, payload) {
  return apiFetch(`/api/events/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteEvent(id, organizerEmail) {
  return apiFetch(`/api/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
    body: { organizerEmail },
  });
}

export function joinEvent(id, userData) {
  return apiFetch(`/api/events/${encodeURIComponent(id)}/join`, {
    method: "POST",
    body: userData,
  });
}

export function leaveEvent(id, userEmail) {
  return apiFetch(`/api/events/${encodeURIComponent(id)}/leave`, {
    method: "POST",
    body: { userEmail },
  });
}

export function getUserProfile(email) {
  return apiFetch(`/api/users/${encodeURIComponent(email)}/profile`);
}

export function updateUserProfile(email, data) {
  return apiFetch(`/api/users/${encodeURIComponent(email)}/profile`, {
    method: "PATCH",
    body: data,
  });
}
