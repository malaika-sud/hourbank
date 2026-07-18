import type { ListingSummary, PublicProfile } from "@hourbank/shared";

export const fallbackListings: ListingSummary[] = [
  {
    id: "30000000-0000-0000-0000-000000000001",
    userId: "20000000-0000-0000-0000-000000000001",
    type: "offer",
    title: "Spanish tutoring for beginners",
    description: "Conversation practice, homework help, or trip prep in a relaxed one-on-one session.",
    category: "Education",
    estHours: 1.5,
    approxArea: "Mission District",
    status: "active",
    createdAt: "2026-07-12T00:03:21.531Z",
  },
  {
    id: "30000000-0000-0000-0000-000000000002",
    userId: "20000000-0000-0000-0000-000000000002",
    type: "offer",
    title: "Basic bike tune-up",
    description: "Brake adjustments, flat fixes, bolt checks, and small repair troubleshooting.",
    category: "Repair",
    estHours: 2,
    approxArea: "Lower Haight",
    status: "active",
    createdAt: "2026-07-12T00:03:21.531Z",
  },
  {
    id: "30000000-0000-0000-0000-000000000003",
    userId: "20000000-0000-0000-0000-000000000003",
    type: "request",
    title: "Help moving a small bookcase",
    description: "One person needed to carry a bookcase down two flights of stairs this weekend.",
    category: "Home",
    estHours: 1,
    approxArea: "SoMa",
    status: "active",
    createdAt: "2026-07-12T00:03:21.531Z",
  },
];

export const fallbackProfiles: PublicProfile[] = [
  {
    id: "20000000-0000-0000-0000-000000000001",
    displayName: "Maya Chen",
    bio: "Happy to trade tutoring and resume help for practical neighborhood favors.",
    approxArea: "Mission District",
    verificationTier: 1,
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    displayName: "Jordan Rivera",
    bio: "Bike commuter, dog person, and generally useful on weekends.",
    approxArea: "Lower Haight",
    verificationTier: 1,
  },
  {
    id: "20000000-0000-0000-0000-000000000003",
    displayName: "Sam Patel",
    bio: "Looking for help around the apartment and glad to trade pet care.",
    approxArea: "SoMa",
    verificationTier: 0,
  },
];
