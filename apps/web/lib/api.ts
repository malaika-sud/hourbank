import type { ListingSummary, PublicProfile } from "@hourbank/shared";
import { fallbackListings, fallbackProfiles } from "./fallback-data";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100";

export async function getListings(): Promise<ListingSummary[]> {
  return getJson<ListingSummary[]>("/listings", fallbackListings);
}

export async function getProfiles(): Promise<PublicProfile[]> {
  return getJson<PublicProfile[]>("/profiles", fallbackProfiles);
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
