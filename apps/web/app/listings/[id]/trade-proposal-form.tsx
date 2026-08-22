"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { CreateTradeInput, ListingSummary, PublicProfile, TradeDetail } from "@hourbank/shared/domain";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100";

interface TradeProposalFormProps {
  listing: ListingSummary;
  ownerProfile: PublicProfile | null;
  profiles: PublicProfile[];
  trades: TradeDetail[];
}

export function TradeProposalForm({ listing, ownerProfile, profiles, trades }: TradeProposalFormProps) {
  const router = useRouter();
  const eligibleProfiles = useMemo(() => {
    const unavailableParticipantIds = new Set(
      trades
        .filter((trade) => trade.listingId === listing.id && isOpenTradeStatus(trade.status))
        .map((trade) => (listing.type === "offer" ? trade.requesterId : trade.providerId)),
    );

    return profiles.filter(
      (profile) => profile.id !== listing.userId && !unavailableParticipantIds.has(profile.id),
    );
  }, [listing.id, listing.type, listing.userId, profiles, trades]);
  const [participantId, setParticipantId] = useState(eligibleProfiles[0]?.id ?? "");
  const [agreedHours, setAgreedHours] = useState((listing.estHours ?? 1).toString());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProfile = eligibleProfiles.find((profile) => profile.id === participantId);
  const ownerName = ownerProfile?.displayName ?? "the listing owner";
  const participantLabel = listing.type === "offer" ? "Requesting as" : "Offering help as";
  const relationshipNote = selectedProfile
    ? getRelationshipNote(listing, selectedProfile.displayName, ownerName)
    : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: CreateTradeInput = {
      listingId: listing.id,
      participantId,
      agreedHours: Number(agreedHours),
    };

    try {
      const response = await fetch(`${apiBaseUrl}/trades`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      await response.json();
      router.push("/trades");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not create trade proposal");
      setIsSubmitting(false);
    }
  }

  if (eligibleProfiles.length === 0) {
    return <p className="empty-note">No demo profiles are available for a new proposal on this listing.</p>;
  }

  return (
    <form className="proposal-form" onSubmit={handleSubmit}>
      <label>
        <span>{participantLabel}</span>
        <select
          onChange={(event) => setParticipantId(event.target.value)}
          required
          value={participantId}
        >
          {eligibleProfiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.displayName}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Agreed hours</span>
        <input
          min="0.25"
          max="24"
          onChange={(event) => setAgreedHours(event.target.value)}
          step="0.25"
          type="number"
          value={agreedHours}
        />
      </label>

      {relationshipNote ? <p className="form-note">{relationshipNote}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <button className="primary-action" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Proposing..." : "Propose trade"}
      </button>
    </form>
  );
}

function isOpenTradeStatus(status: TradeDetail["status"]): boolean {
  return status === "proposed" || status === "accepted" || status === "in_progress";
}

function getRelationshipNote(listing: ListingSummary, participantName: string, ownerName: string): string {
  if (listing.type === "offer") {
    return `${participantName} will request help from ${ownerName}. Credits are not reserved yet.`;
  }

  return `${participantName} will offer help to ${ownerName}. Credits are not reserved yet.`;
}

async function getApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };

    if (Array.isArray(body.message)) {
      return body.message.join(", ");
    }

    return body.message ?? "Could not create trade proposal";
  } catch {
    return "Could not create trade proposal";
  }
}
