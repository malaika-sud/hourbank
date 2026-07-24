import type { ListingSummary, ProfileDetail, PublicProfile } from "@hourbank/shared";
import { fallbackListings, fallbackProfileDetails, fallbackProfiles } from "./fallback-data";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100";

export async function getListings(): Promise<ListingSummary[]> {
  return getJson<ListingSummary[]>("/listings", fallbackListings);
}

export async function getListing(id: string): Promise<ListingSummary | null> {
  const fallback = fallbackListings.find((listing) => listing.id === id) ?? null;

  return getJson<ListingSummary | null>(`/listings/${id}`, fallback);
}

export async function getProfiles(): Promise<PublicProfile[]> {
  return getJson<PublicProfile[]>("/profiles", fallbackProfiles);
}

export async function getProfile(id: string): Promise<ProfileDetail | null> {
  const fallback = fallbackProfileDetails.find((profile) => profile.id === id) ?? null;

  return getJson<ProfileDetail | null>(`/profiles/${id}`, fallback);
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
