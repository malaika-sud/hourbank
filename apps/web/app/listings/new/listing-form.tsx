"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  listingCategories,
  listingTypes,
  type CreateListingInput,
  type ListingCategory,
  type ListingSummary,
  type ListingType,
  type PublicProfile,
} from "@hourbank/shared/domain";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100";

export function ListingForm({ profiles }: { profiles: PublicProfile[] }) {
  const router = useRouter();
  const firstProfile = profiles[0];
  const [selectedUserId, setSelectedUserId] = useState(firstProfile?.id ?? "");
  const [type, setType] = useState<ListingType>("offer");
  const [category, setCategory] = useState<ListingCategory>("Education");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estHours, setEstHours] = useState("1");
  const [approxArea, setApproxArea] = useState(firstProfile?.approxArea ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedUserId),
    [profiles, selectedUserId],
  );

  function handleProfileChange(userId: string) {
    const nextProfile = profiles.find((profile) => profile.id === userId);
    setSelectedUserId(userId);

    if (nextProfile) {
      setApproxArea(nextProfile.approxArea);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: CreateListingInput = {
      userId: selectedUserId,
      type,
      title,
      description,
      category,
      estHours: estHours ? Number(estHours) : null,
      approxArea,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      const listing = (await response.json()) as ListingSummary;
      router.push(`/listings/${listing.id}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not create listing");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="listing-form" onSubmit={handleSubmit}>
      <div className="field-row">
        <label>
          <span>Posting as</span>
          <select
            value={selectedUserId}
            onChange={(event) => handleProfileChange(event.target.value)}
            required
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.displayName}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Public area</span>
          <input
            value={approxArea}
            onChange={(event) => setApproxArea(event.target.value)}
            placeholder="Mission District"
            required
          />
        </label>
      </div>

      <fieldset>
        <legend>Listing type</legend>
        <div className="segmented-control input-segmented">
          {listingTypes.map((listingType) => (
            <button
              className={listingType === type ? "selected" : ""}
              key={listingType}
              onClick={() => setType(listingType)}
              type="button"
            >
              {listingType === "offer" ? "Offer help" : "Request help"}
            </button>
          ))}
        </div>
      </fieldset>

      <label>
        <span>Title</span>
        <input
          maxLength={120}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Spanish tutoring for beginners"
          required
          value={title}
        />
      </label>

      <div className="field-row">
        <label>
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value as ListingCategory)}>
            {listingCategories.map((listingCategory) => (
              <option key={listingCategory} value={listingCategory}>
                {listingCategory}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Estimated hours</span>
          <input
            min="0.25"
            max="24"
            onChange={(event) => setEstHours(event.target.value)}
            step="0.25"
            type="number"
            value={estHours}
          />
        </label>
      </div>

      <label>
        <span>Description</span>
        <textarea
          maxLength={800}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the help, timing, and any details someone should know."
          required
          rows={6}
          value={description}
        />
      </label>

      {selectedProfile ? (
        <p className="form-note">
          Demo mode uses {selectedProfile.displayName}'s saved neighborhood as the private map location.
        </p>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}

      <button className="primary-action" disabled={isSubmitting || profiles.length === 0} type="submit">
        {isSubmitting ? "Creating listing..." : "Create listing"}
      </button>
    </form>
  );
}

async function getApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };

    if (Array.isArray(body.message)) {
      return body.message.join(", ");
    }

    return body.message ?? "Could not create listing";
  } catch {
    return "Could not create listing";
  }
}
