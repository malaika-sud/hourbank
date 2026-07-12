import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ProfileDetail, PublicProfile, UserSkill } from "@hourbank/shared";
import { DatabaseService } from "../database/database.service.js";

interface ProfileRow {
  id: string;
  displayName: string;
  bio: string | null;
  approxArea: string;
  verificationTier: number;
  skills: UserSkill[] | string | null;
}

@Injectable()
export class ProfilesService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async findAll(): Promise<PublicProfile[]> {
    const result = await this.database.query<ProfileRow>(
      `
        SELECT
          id::text,
          display_name AS "displayName",
          bio,
          approx_area AS "approxArea",
          verification_tier AS "verificationTier"
        FROM users
        ORDER BY display_name ASC
        LIMIT 50
      `,
    );

    return result.rows.map(toPublicProfile);
  }

  async findById(id: string): Promise<ProfileDetail> {
    const result = await this.database.query<ProfileRow>(
      `
        SELECT
          users.id::text,
          users.display_name AS "displayName",
          users.bio,
          users.approx_area AS "approxArea",
          users.verification_tier AS "verificationTier",
          COALESCE(
            json_agg(
              json_build_object(
                'kind', user_skills.kind,
                'skill', json_build_object(
                  'id', skills.id::text,
                  'name', skills.name,
                  'category', skills.category
                )
              )
              ORDER BY skills.category, skills.name
            ) FILTER (WHERE skills.id IS NOT NULL),
            '[]'::json
          ) AS skills
        FROM users
        LEFT JOIN user_skills ON user_skills.user_id = users.id
        LEFT JOIN skills ON skills.id = user_skills.skill_id
        WHERE users.id = $1
        GROUP BY users.id
      `,
      [id],
    );

    const profile = result.rows[0];

    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    return {
      ...toPublicProfile(profile),
      skills: parseSkills(profile.skills),
    };
  }
}

function toPublicProfile(row: ProfileRow): PublicProfile {
  return {
    id: row.id,
    displayName: row.displayName,
    bio: row.bio,
    approxArea: row.approxArea,
    verificationTier: row.verificationTier,
  };
}

function parseSkills(value: ProfileRow["skills"]): UserSkill[] {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return JSON.parse(value) as UserSkill[];
  }

  return value;
}
