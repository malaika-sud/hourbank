import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  type CreateListingInput,
  type ListingCategory,
  type ListingStatus,
  type ListingSummary,
  type ListingType,
  listingCategories,
  listingStatuses,
  listingTypes,
} from "@hourbank/shared";
import { DatabaseService } from "../database/database.service.js";

export interface ListingFilters {
  type?: string;
  category?: string;
  status?: string;
}

interface ListingRow {
  id: string;
  userId: string;
  type: ListingType;
  title: string;
  description: string;
  category: string;
  estHours: string | number | null;
  approxArea: string;
  status: ListingStatus;
  createdAt: Date | string;
}

@Injectable()
export class ListingsService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async findAll(filters: ListingFilters): Promise<ListingSummary[]> {
    const { clauses, values } = this.buildFilters(filters);

    const result = await this.database.query<ListingRow>(
      `
        SELECT
          id::text,
          user_id::text AS "userId",
          type::text AS type,
          title,
          description,
          category,
          est_hours AS "estHours",
          approx_area AS "approxArea",
          status::text AS status,
          created_at AS "createdAt"
        FROM listings
        WHERE ${clauses.join(" AND ")}
        ORDER BY created_at DESC
        LIMIT 50
      `,
      values,
    );

    return result.rows.map(toListingSummary);
  }

  async create(body: unknown): Promise<ListingSummary> {
    const input = parseCreateListingInput(body);

    const result = await this.database.query<ListingRow>(
      `
        INSERT INTO listings (
          user_id,
          type,
          title,
          description,
          category,
          est_hours,
          location,
          approx_area
        )
        SELECT
          users.id,
          $2::listing_type,
          $3,
          $4,
          $5,
          $6,
          users.home_location,
          $7
        FROM users
        WHERE users.id = $1
        RETURNING
          id::text,
          user_id::text AS "userId",
          type::text AS type,
          title,
          description,
          category,
          est_hours AS "estHours",
          approx_area AS "approxArea",
          status::text AS status,
          created_at AS "createdAt"
      `,
      [
        input.userId,
        input.type,
        input.title,
        input.description,
        input.category,
        input.estHours ?? null,
        input.approxArea,
      ],
    );

    const listing = result.rows[0];

    if (!listing) {
      throw new NotFoundException("Profile not found");
    }

    return toListingSummary(listing);
  }

  async findById(id: string): Promise<ListingSummary> {
    const result = await this.database.query<ListingRow>(
      `
        SELECT
          id::text,
          user_id::text AS "userId",
          type::text AS type,
          title,
          description,
          category,
          est_hours AS "estHours",
          approx_area AS "approxArea",
          status::text AS status,
          created_at AS "createdAt"
        FROM listings
        WHERE id = $1
      `,
      [id],
    );

    const listing = result.rows[0];

    if (!listing) {
      throw new NotFoundException("Listing not found");
    }

    return toListingSummary(listing);
  }

  private buildFilters(filters: ListingFilters) {
    const clauses = ["status = $1"];
    const values: unknown[] = [this.parseStatus(filters.status ?? "active")];

    if (filters.type) {
      values.push(this.parseType(filters.type));
      clauses.push(`type = $${values.length}`);
    }

    if (filters.category) {
      values.push(filters.category);
      clauses.push(`category = $${values.length}`);
    }

    return { clauses, values };
  }

  private parseType(value: string): ListingType {
    if (listingTypes.includes(value as ListingType)) {
      return value as ListingType;
    }

    throw new BadRequestException("Listing type must be offer or request");
  }

  private parseStatus(value: string): ListingStatus {
    if (listingStatuses.includes(value as ListingStatus)) {
      return value as ListingStatus;
    }

    throw new BadRequestException("Listing status is not supported");
  }
}

function parseCreateListingInput(body: unknown): CreateListingInput {
  if (!isRecord(body)) {
    throw new BadRequestException("Request body is required");
  }

  return {
    userId: parseRequiredText(body.userId, "userId", 80),
    type: parseTypeValue(body.type),
    title: parseRequiredText(body.title, "title", 120),
    description: parseRequiredText(body.description, "description", 800),
    category: parseCategoryValue(body.category),
    estHours: parseEstimatedHours(body.estHours),
    approxArea: parseRequiredText(body.approxArea, "approxArea", 80),
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

function parseTypeValue(value: unknown): ListingType {
  if (typeof value === "string" && listingTypes.includes(value as ListingType)) {
    return value as ListingType;
  }

  throw new BadRequestException("Listing type must be offer or request");
}

function parseCategoryValue(value: unknown): ListingCategory {
  if (typeof value === "string" && listingCategories.includes(value as ListingCategory)) {
    return value as ListingCategory;
  }

  throw new BadRequestException("Listing category is not supported");
}

function parseEstimatedHours(value: unknown): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const hours = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(hours) || hours <= 0 || hours > 24) {
    throw new BadRequestException("Estimated hours must be between 0 and 24");
  }

  return Math.round(hours * 100) / 100;
}

function toListingSummary(row: ListingRow): ListingSummary {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    title: row.title,
    description: row.description,
    category: row.category,
    estHours: row.estHours === null ? null : Number(row.estHours),
    approxArea: row.approxArea,
    status: row.status,
    createdAt: toIsoString(row.createdAt),
  };
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
