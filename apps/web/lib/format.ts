import type { ListingSummary, PublicProfile } from "@hourbank/shared";

export function formatHours(hours: ListingSummary["estHours"]): string {
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

export function titleCaseListingType(type: ListingSummary["type"]): string {
  return type === "offer" ? "Offer" : "Request";
}
