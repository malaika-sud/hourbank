import { Inject, Injectable } from "@nestjs/common";
import type { Skill } from "@hourbank/shared";
import { DatabaseService } from "../database/database.service.js";

@Injectable()
export class SkillsService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async findAll(): Promise<Skill[]> {
    const result = await this.database.query<Skill>(
      `
        SELECT
          id::text,
          name,
          category
        FROM skills
        ORDER BY category ASC, name ASC
      `,
    );

    return result.rows;
  }
}
