import type {
  ListingCategory,
  ListingSummary,
  ListingType,
  ProfileDetail,
  PublicProfile,
  Skill,
  TradeDetail,
} from "@hourbank/shared";
import { fallbackListings, fallbackProfileDetails, fallbackProfiles, fallbackSkills, fallbackTrades } from "./fallback-data";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100";

export interface ListingFilters {
  type?: ListingType;
  category?: ListingCategory;
}

export async function getListings(filters: ListingFilters = {}): Promise<ListingSummary[]> {
  return getJson<ListingSummary[]>(buildListingsPath(filters), filterFallbackListings(filters));
}

export async function getListing(id: string): Promise<ListingSummary | null> {
  const fallback = fallbackListings.find((listing) => listing.id === id) ?? null;

  return getJson<ListingSummary | null>(`/listings/${id}`, fallback);
}

export async function getProfiles(): Promise<PublicProfile[]> {
  return getJson<PublicProfile[]>("/profiles", fallbackProfiles);
}

export async function getSkills(): Promise<Skill[]> {
  return getJson<Skill[]>("/skills", fallbackSkills);
}

export async function getProfile(id: string): Promise<ProfileDetail | null> {
  const fallback = fallbackProfileDetails.find((profile) => profile.id === id) ?? null;

  return getJson<ProfileDetail | null>(`/profiles/${id}`, fallback);
}

export async function getTrades(): Promise<TradeDetail[]> {
  return getJson<TradeDetail[]>("/trades", fallbackTrades);
}

export async function getTrade(id: string): Promise<TradeDetail | null> {
  const fallback = fallbackTrades.find((trade) => trade.id === id) ?? null;

  return getJson<TradeDetail | null>(`/trades/${id}`, fallback);
}

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return fallback;
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

function buildListingsPath(filters: ListingFilters): string {
  const params = new URLSearchParams();

  if (filters.type) {
    params.set("type", filters.type);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  const query = params.toString();
  return query ? `/listings?${query}` : "/listings";
}

function filterFallbackListings(filters: ListingFilters): ListingSummary[] {
  return fallbackListings.filter((listing) => {
    const matchesType = filters.type ? listing.type === filters.type : true;
    const matchesCategory = filters.category ? listing.category === filters.category : true;

    return matchesType && matchesCategory;
  });
}
