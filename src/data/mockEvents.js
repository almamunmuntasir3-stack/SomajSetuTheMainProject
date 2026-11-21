export const mockEvents = [
  {
    id: "evt-001",
    title: "Buriganga Riverbank Cleanup & Waste Sorting Drive",
    category: "Environment",
    categoryGroup: "Environment",
    description:
      "Join volunteers, boat operators, and local youth groups to remove plastic waste from the Buriganga riverbank near Sadarghat, separate recyclables, and record collection data for community awareness.",
    location: "Sadarghat River Terminal, Old Dhaka",
    eventDate: "2026-12-05T08:00:00+06:00",
    dateLabel: "Saturday, 5 December 2026 • 8:00 AM",
    organizer: "Dhaka River Keepers",
    volunteersNeeded: 120,
    currentVolunteers: 76,
    imageUrl:
      "/images/event-river.jpg",
  },
  {
    id: "evt-002",
    title: "Hatirjheel Canal Cleanup and Awareness Walk",
    category: "Environment",
    categoryGroup: "Environment",
    description:
      "Help restore a cleaner canal edge around Hatirjheel by collecting litter, installing awareness placards, and engaging morning walkers on responsible waste disposal habits.",
    location: "Hatirjheel Amphitheatre Area, Dhaka",
    eventDate: "2026-12-12T07:30:00+06:00",
    dateLabel: "Saturday, 12 December 2026 • 7:30 AM",
    organizer: "Hatirjheel Community Forum",
    volunteersNeeded: 80,
    currentVolunteers: 48,
    imageUrl:
      "/images/gallery-cleanup.jpg",
  },
  {
    id: "evt-003",
    title: "Ramna Park Native Tree Plantation Morning",
    category: "Tree Plantation",
    categoryGroup: "Environment",
    description:
      "Plant native shade and fruit saplings with gardeners and students, learn proper mulching and watering techniques, and help tag each tree for long-term community care.",
    location: "Ramna Park, Dhaka",
    eventDate: "2026-12-19T07:00:00+06:00",
    dateLabel: "Saturday, 19 December 2026 • 7:00 AM",
    organizer: "Ramna Green Brigade",
    volunteersNeeded: 150,
    currentVolunteers: 92,
    imageUrl:
      "/images/event-tree.jpg",
  },
  {
    id: "evt-004",
    title: "Cox's Bazar Coastal Tree Plantation for Dune Protection",
    category: "Tree Plantation",
    categoryGroup: "Environment",
    description:
      "Work alongside coastal residents to plant salt-tolerant saplings that help protect sand dunes, reduce erosion, and create a greener buffer along the shoreline.",
    location: "Kolatoli Beach Community Zone, Cox's Bazar",
    eventDate: "2027-01-09T07:00:00+06:00",
    dateLabel: "Saturday, 9 January 2027 • 7:00 AM",
    organizer: "Cox's Bazar Coastal Alliance",
    volunteersNeeded: 200,
    currentVolunteers: 138,
    imageUrl:
      "/images/gallery-planting.jpg",
  },
  {
    id: "evt-005",
    title: "Free Community Health Camp at Mirpur",
    category: "Health Camp",
    categoryGroup: "Health",
    description:
      "Support doctors and nurses providing basic check-ups, blood pressure and glucose screening, child nutrition guidance, and medicine referrals for families in Mirpur.",
    location: "Mirpur-10 Community Center, Dhaka",
    eventDate: "2027-01-16T09:00:00+06:00",
    dateLabel: "Saturday, 16 January 2027 • 9:00 AM",
    organizer: "Mirpur Health Volunteers",
    volunteersNeeded: 60,
    currentVolunteers: 34,
    imageUrl:
      "/images/gallery-health.jpg",
  },
  {
    id: "evt-006",
    title: "Char Area Mobile Health & Hygiene Camp",
    category: "Health Camp",
    categoryGroup: "Health",
    description:
      "Assist a mobile medical team serving river-island families with primary care consultations, maternal health advice, hygiene kits distribution, and follow-up registration.",
    location: "Nandail Char Primary School Grounds, Mymensingh",
    eventDate: "2027-01-23T08:30:00+06:00",
    dateLabel: "Saturday, 23 January 2027 • 8:30 AM",
    organizer: "Char Area Outreach Team",
    volunteersNeeded: 45,
    currentVolunteers: 21,
    imageUrl:
      "/images/event-health.jpg",
  },
  {
    id: "evt-007",
    title: "Winter Cloth Drive for Northern District Families",
    category: "Winter Cloth Drive",
    categoryGroup: "Relief",
    description:
      "Sort, pack, and distribute warm clothes, blankets, and children's winter wear to families facing severe cold in northern communities, with dignity-focused distribution support.",
    location: "Kurigram Town Hall Collection Point, Kurigram",
    eventDate: "2026-12-26T10:00:00+06:00",
    dateLabel: "Saturday, 26 December 2026 • 10:00 AM",
    organizer: "Northern Winter Relief Network",
    volunteersNeeded: 90,
    currentVolunteers: 57,
    imageUrl:
      "/images/event-default.jpg",
  },
  {
    id: "evt-008",
    title: "Youth Literacy Workshop & Reading Circle in Rajshahi",
    category: "Youth Literacy Workshop",
    categoryGroup: "Education",
    description:
      "Facilitate reading circles, basic digital literacy activities, and storytelling sessions for adolescents, while helping set up a small community bookshelf for ongoing learning.",
    location: "Padma Riverside Community Library, Rajshahi",
    eventDate: "2027-02-06T15:00:00+06:00",
    dateLabel: "Saturday, 6 February 2027 • 3:00 PM",
    organizer: "Rajshahi Reading Circle",
    volunteersNeeded: 35,
    currentVolunteers: 19,
    imageUrl:
      "/images/event-learning.jpg",
  },
];

export const eventCategories = [
  "Environment",
  "Tree Plantation",
  "Health Camp",
  "Winter Cloth Drive",
  "Youth Literacy Workshop",
];

export const eventFilterCategories = [
  "All",
  "Environment",
  "Health",
  "Education",
  "Relief",
  "Community",
];

/**
 * Stands in for a `where eventDate > now orderBy eventDate asc limit(n)` query.
 * `use cache` keeps the current-time read compatible with Cache Components.
 */
export async function getUpcomingEvents(limit) {
  "use cache";

  const now = Date.now();

  const upcoming = mockEvents
    .filter((event) => new Date(event.eventDate).getTime() > now)
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );

  return typeof limit === "number" ? upcoming.slice(0, limit) : upcoming;
}
