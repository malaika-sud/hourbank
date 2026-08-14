import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ProfileDetail, PublicProfile, UpdateProfileInput, UserSkill } from "@hourbank/shared";
import { DatabaseService, type DatabaseClient } from "../database/database.service.js";

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
    return this.findByIdWithClient(this.database, id);
  }

  async update(id: string, body: unknown): Promise<ProfileDetail> {
    const input = parseUpdateProfileInput(body);
    const skillIds = [...new Set([...input.offeredSkillIds, ...input.wantedSkillIds])];

    await this.assertSkillsExist(skillIds);

    return this.database.transaction(async (client) => {
      const updateResult = await client.query<ProfileRow>(
        `
          UPDATE users
          SET
            display_name = $2,
            bio = $3,
            approx_area = $4
          WHERE id = $1
          RETURNING id::text
        `,
        [id, input.displayName, input.bio ?? null, input.approxArea],
      );

      if (!updateResult.rows[0]) {
        throw new NotFoundException("Profile not found");
      }

      await client.query("DELETE FROM user_skills WHERE user_id = $1", [id]);

      if (skillIds.length > 0) {
        await client.query(
          `
            INSERT INTO user_skills (user_id, skill_id, kind)
            SELECT
              $1::uuid,
              selected_skills.skill_id::uuid,
              selected_skills.kind::user_skill_kind
            FROM (
              SELECT unnest($2::uuid[]) AS skill_id, 'offer'::user_skill_kind AS kind
              UNION ALL
              SELECT unnest($3::uuid[]) AS skill_id, 'want'::user_skill_kind AS kind
            ) selected_skills
            ON CONFLICT (user_id, skill_id, kind) DO NOTHING
          `,
          [id, input.offeredSkillIds, input.wantedSkillIds],
        );
      }

      return this.findByIdWithClient(client, id);
    });
  }

  private async findByIdWithClient(client: DatabaseClient, id: string): Promise<ProfileDetail> {
    const result = await client.query<ProfileRow>(
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

  private async assertSkillsExist(skillIds: string[]): Promise<void> {
    if (skillIds.length === 0) {
      return;
    }

    const result = await this.database.query<{ id: string }>(
      `
        SELECT id::text
        FROM skills
        WHERE id = ANY($1::uuid[])
      `,
      [skillIds],
    );

    const foundIds = new Set(result.rows.map((row) => row.id));
    const missingIds = skillIds.filter((skillId) => !foundIds.has(skillId));

    if (missingIds.length > 0) {
      throw new BadRequestException("One or more selected skills are not supported");
    }
  }
}

function parseUpdateProfileInput(body: unknown): UpdateProfileInput {
  if (!isRecord(body)) {
    throw new BadRequestException("Request body is required");
  }

  return {
    displayName: parseRequiredText(body.displayName, "displayName", 80),
    bio: parseOptionalText(body.bio, "bio", 500),
    approxArea: parseRequiredText(body.approxArea, "approxArea", 80),
    offeredSkillIds: parseSkillIds(body.offeredSkillIds, "offeredSkillIds"),
    wantedSkillIds: parseSkillIds(body.wantedSkillIds, "wantedSkillIds"),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseRequiredText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string") {
    throw new BadRequestException(`${field} is required`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new BadRequestException(`${field} is required`);
  }

  if (trimmed.length > maxLength) {
    throw new BadRequestException(`${field} must be ${maxLength} characters or fewer`);
  }

  return trimmed;
}

function parseOptionalText(value: unknown, field: string, maxLength: number): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new BadRequestException(`${field} must be text`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.length > maxLength) {
    throw new BadRequestException(`${field} must be ${maxLength} characters or fewer`);
  }

  return trimmed;
}

function parseSkillIds(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new BadRequestException(`${field} must be a list`);
  }

  if (value.length > 20) {
    throw new BadRequestException(`${field} must include 20 skills or fewer`);
  }

  const ids = value.map((skillId) => {
    if (typeof skillId !== "string" || !isUuid(skillId)) {
      throw new BadRequestException(`${field} includes an invalid skill id`);
    }

    return skillId;
  });

  return [...new Set(ids)];
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
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
