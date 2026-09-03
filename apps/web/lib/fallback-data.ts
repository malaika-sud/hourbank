import type {
  ListingSummary,
  ProfileDetail,
  PublicProfile,
  Skill,
  TradeDetail,
  WalletDetail,
} from "@hourbank/shared";

export const fallbackSkills: Skill[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    name: "Spanish tutoring",
    category: "Education",
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    name: "Moving help",
    category: "Home",
  },
  {
    id: "10000000-0000-0000-0000-000000000003",
    name: "Bike repair",
    category: "Repair",
  },
  {
    id: "10000000-0000-0000-0000-000000000004",
    name: "Dog walking",
    category: "Pets",
  },
  {
    id: "10000000-0000-0000-0000-000000000005",
    name: "Resume review",
    category: "Career",
  },
];

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

export const fallbackProfileDetails: ProfileDetail[] = [
  {
    id: "20000000-0000-0000-0000-000000000001",
    displayName: "Maya Chen",
    bio: "Happy to trade tutoring and resume help for practical neighborhood favors.",
    approxArea: "Mission District",
    verificationTier: 1,
    skills: [
      {
        kind: "offer",
        skill: {
          id: "10000000-0000-0000-0000-000000000001",
          name: "Spanish tutoring",
          category: "Education",
        },
      },
      {
        kind: "offer",
        skill: {
          id: "10000000-0000-0000-0000-000000000005",
          name: "Resume review",
          category: "Career",
        },
      },
      {
        kind: "want",
        skill: {
          id: "10000000-0000-0000-0000-000000000002",
          name: "Moving help",
          category: "Home",
        },
      },
    ],
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    displayName: "Jordan Rivera",
    bio: "Bike commuter, dog person, and generally useful on weekends.",
    approxArea: "Lower Haight",
    verificationTier: 1,
    skills: [
      {
        kind: "offer",
        skill: {
          id: "10000000-0000-0000-0000-000000000003",
          name: "Bike repair",
          category: "Repair",
        },
      },
      {
        kind: "want",
        skill: {
          id: "10000000-0000-0000-0000-000000000004",
          name: "Dog walking",
          category: "Pets",
        },
      },
    ],
  },
  {
    id: "20000000-0000-0000-0000-000000000003",
    displayName: "Sam Patel",
    bio: "Looking for help around the apartment and glad to trade pet care.",
    approxArea: "SoMa",
    verificationTier: 0,
    skills: [
      {
        kind: "offer",
        skill: {
          id: "10000000-0000-0000-0000-000000000004",
          name: "Dog walking",
          category: "Pets",
        },
      },
      {
        kind: "want",
        skill: {
          id: "10000000-0000-0000-0000-000000000003",
          name: "Bike repair",
          category: "Repair",
        },
      },
    ],
  },
];

export const fallbackProfiles: PublicProfile[] = fallbackProfileDetails.map(({ skills: _skills, ...profile }) => profile);

export const fallbackTrades: TradeDetail[] = [
  {
    id: "60000000-0000-0000-0000-000000000001",
    listingId: "30000000-0000-0000-0000-000000000001",
    requesterId: "20000000-0000-0000-0000-000000000002",
    providerId: "20000000-0000-0000-0000-000000000001",
    agreedHours: 1.5,
    creditMultiplier: 1,
    agreedCredits: 1.5,
    status: "proposed",
    createdAt: "2026-07-12T00:03:21.531Z",
    updatedAt: "2026-07-12T00:03:21.531Z",
    listing: {
      id: "30000000-0000-0000-0000-000000000001",
      type: "offer",
      title: "Spanish tutoring for beginners",
      category: "Education",
      approxArea: "Mission District",
      estHours: 1.5,
    },
    requester: fallbackProfiles[1],
    provider: fallbackProfiles[0],
  },
  {
    id: "60000000-0000-0000-0000-000000000002",
    listingId: "30000000-0000-0000-0000-000000000003",
    requesterId: "20000000-0000-0000-0000-000000000003",
    providerId: "20000000-0000-0000-0000-000000000002",
    agreedHours: 1,
    creditMultiplier: 1,
    agreedCredits: 1,
    status: "accepted",
    createdAt: "2026-07-12T00:03:21.531Z",
    updatedAt: "2026-07-12T00:03:21.531Z",
    listing: {
      id: "30000000-0000-0000-0000-000000000003",
      type: "request",
      title: "Help moving a small bookcase",
      category: "Home",
      approxArea: "SoMa",
      estHours: 1,
    },
    requester: fallbackProfiles[2],
    provider: fallbackProfiles[1],
  },
];

export const fallbackWallets: WalletDetail[] = [
  {
    profile: fallbackProfiles[0],
    accountId: "40000000-0000-0000-0000-000000000101",
    availableBalance: 5,
    entries: [
      {
        transactionId: "50000000-0000-0000-0000-000000000001",
        kind: "grant",
        amount: 5,
        createdAt: "2026-07-12T00:03:21.531Z",
      },
    ],
  },
  {
    profile: fallbackProfiles[1],
    accountId: "40000000-0000-0000-0000-000000000102",
    availableBalance: 5,
    entries: [
      {
        transactionId: "50000000-0000-0000-0000-000000000002",
        kind: "grant",
        amount: 5,
        createdAt: "2026-07-12T00:03:21.531Z",
      },
    ],
  },
  {
    profile: fallbackProfiles[2],
    accountId: "40000000-0000-0000-0000-000000000103",
    availableBalance: 5,
    entries: [
      {
        transactionId: "50000000-0000-0000-0000-000000000003",
        kind: "grant",
        amount: 5,
        createdAt: "2026-07-12T00:03:21.531Z",
      },
    ],
  },
];
