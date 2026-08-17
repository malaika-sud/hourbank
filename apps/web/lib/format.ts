import type { PublicProfile } from "@hourbank/shared";

export function formatHours(hours: number | null | undefined): string {
  if (hours === null || hours === undefined) {
    return "Time TBD";
  }

  return `${hours} hour${hours === 1 ? "" : "s"}`;
}

export function getProfileInitials(profile: Pick<PublicProfile, "displayName">): string {
  return profile.displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function titleCaseListingType(type: "offer" | "request"): string {
  return type === "offer" ? "Offer" : "Request";
}
