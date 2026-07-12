import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  type ListingStatus,
  type ListingSummary,
  type ListingType,
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
