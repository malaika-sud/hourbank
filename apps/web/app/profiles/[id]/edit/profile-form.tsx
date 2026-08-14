"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { ProfileDetail, Skill, UpdateProfileInput } from "@hourbank/shared/domain";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100";

interface ProfileFormProps {
  profile: ProfileDetail;
  skills: Skill[];
}

export function ProfileForm({ profile, skills }: ProfileFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [approxArea, setApproxArea] = useState(profile.approxArea);
  const [offeredSkillIds, setOfferedSkillIds] = useState(() => getProfileSkillIds(profile, "offer"));
  const [wantedSkillIds, setWantedSkillIds] = useState(() => getProfileSkillIds(profile, "want"));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const skillGroups = useMemo(() => groupSkillsByCategory(skills), [skills]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: UpdateProfileInput = {
      displayName,
      bio,
      approxArea,
      offeredSkillIds,
      wantedSkillIds,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/profiles/${profile.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      router.push(`/profiles/${profile.id}`);
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not update profile");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="field-row">
        <label>
          <span>Display name</span>
          <input
            maxLength={80}
            onChange={(event) => setDisplayName(event.target.value)}
            required
            value={displayName}
          />
        </label>

        <label>
          <span>Public area</span>
          <input
            maxLength={80}
            onChange={(event) => setApproxArea(event.target.value)}
            placeholder="Mission District"
            required
            value={approxArea}
          />
        </label>
      </div>

      <label>
        <span>Bio</span>
        <textarea
          maxLength={500}
          onChange={(event) => setBio(event.target.value)}
          placeholder="What kinds of help do you enjoy trading?"
          rows={5}
          value={bio}
        />
      </label>

      <div className="skill-edit-grid">
        <SkillPicker
          groups={skillGroups}
          legend="Skills offered"
          selectedIds={offeredSkillIds}
          onToggle={(skillId) => setOfferedSkillIds((current) => toggleSkillId(current, skillId))}
        />

        <SkillPicker
          groups={skillGroups}
          legend="Skills wanted"
          selectedIds={wantedSkillIds}
          onToggle={(skillId) => setWantedSkillIds((current) => toggleSkillId(current, skillId))}
        />
      </div>

      <p className="form-note">
        Demo mode saves changes to the selected seed profile. Profile ownership will move behind
        login in a later milestone.
      </p>

      {error ? <p className="form-error">{error}</p> : null}

      <button className="primary-action" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Saving profile..." : "Save profile"}
      </button>
    </form>
  );
}

function SkillPicker({
  groups,
  legend,
  selectedIds,
  onToggle,
}: {
  groups: SkillGroup[];
  legend: string;
  selectedIds: string[];
  onToggle: (skillId: string) => void;
}) {
  return (
    <fieldset className="skill-edit-section">
      <legend>{legend}</legend>
      {groups.length > 0 ? (
        <div className="skill-category-list">
          {groups.map((group) => (
            <section key={group.category}>
              <h4>{group.category}</h4>
              <div className="skill-check-list">
                {group.skills.map((skill) => (
                  <label className="skill-check" key={skill.id}>
                    <input
                      checked={selectedIds.includes(skill.id)}
                      onChange={() => onToggle(skill.id)}
                      type="checkbox"
                    />
                    <span>{skill.name}</span>
                  </label>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="empty-note">No skills are available yet.</p>
      )}
    </fieldset>
  );
}

interface SkillGroup {
  category: string;
  skills: Skill[];
}

function groupSkillsByCategory(skills: Skill[]): SkillGroup[] {
  const grouped = new Map<string, Skill[]>();

  for (const skill of skills) {
    const current = grouped.get(skill.category) ?? [];
    grouped.set(skill.category, [...current, skill]);
  }

  return [...grouped.entries()].map(([category, groupedSkills]) => ({
    category,
    skills: groupedSkills,
  }));
}

function getProfileSkillIds(profile: ProfileDetail, kind: "offer" | "want"): string[] {
  return profile.skills.filter((userSkill) => userSkill.kind === kind).map((userSkill) => userSkill.skill.id);
}

function toggleSkillId(currentIds: string[], skillId: string): string[] {
  return currentIds.includes(skillId)
    ? currentIds.filter((currentId) => currentId !== skillId)
    : [...currentIds, skillId];
}

async function getApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };

    if (Array.isArray(body.message)) {
      return body.message.join(", ");
    }

    return body.message ?? "Could not update profile";
  } catch {
    return "Could not update profile";
  }
}
