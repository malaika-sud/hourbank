export const listingTypes = ["offer", "request"] as const;
export type ListingType = (typeof listingTypes)[number];

export const listingStatuses = ["active", "paused", "closed"] as const;
export type ListingStatus = (typeof listingStatuses)[number];

export const userSkillKinds = ["offer", "want"] as const;
export type UserSkillKind = (typeof userSkillKinds)[number];

export const tradeStatuses = [
  "proposed",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
  "disputed",
] as const;
export type TradeStatus = (typeof tradeStatuses)[number];

export const ledgerTransactionKinds = [
  "grant",
  "escrow_hold",
  "escrow_release",
  "refund",
  "adjustment",
] as const;
export type LedgerTransactionKind = (typeof ledgerTransactionKinds)[number];

export interface PublicProfile {
  id: string;
  displayName: string;
  bio?: string | null;
  approxArea: string;
  verificationTier: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface UserSkill {
  skill: Skill;
  kind: UserSkillKind;
}

export interface ProfileDetail extends PublicProfile {
  skills: UserSkill[];
}

export interface ListingSummary {
  id: string;
  userId: string;
  type: ListingType;
  title: string;
  description: string;
  category: string;
  estHours?: number | null;
  approxArea: string;
  status: ListingStatus;
  createdAt: string;
}

export interface TradeSummary {
  id: string;
  listingId: string;
  requesterId: string;
  providerId: string;
  agreedHours: number;
  creditMultiplier: number;
  agreedCredits: number;
  status: TradeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerTransactionSummary {
  id: string;
  kind: LedgerTransactionKind;
  tradeId?: string | null;
  createdAt: string;
}

export interface AppraisalSummary {
  id: string;
  listingId: string;
  suggestedHours: number;
  rationale: string;
  model: string;
  confidence?: number | null;
  createdAt: string;
}
