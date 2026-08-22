import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { CreateTradeInput, ListingStatus, ListingType, TradeDetail, TradeStatus } from "@hourbank/shared";
import { DatabaseService } from "../database/database.service.js";

interface TradeRow {
  id: string;
  listingId: string;
  requesterId: string;
  providerId: string;
  agreedHours: string | number;
  creditMultiplier: string | number;
  agreedCredits: string | number;
  status: TradeStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  listingType: ListingType;
  listingTitle: string;
  listingCategory: string;
  listingApproxArea: string;
  listingEstHours: string | number | null;
  requesterDisplayName: string;
  requesterBio: string | null;
  requesterApproxArea: string;
  requesterVerificationTier: number;
  providerDisplayName: string;
  providerBio: string | null;
  providerApproxArea: string;
  providerVerificationTier: number;
}

interface TradeListingRow {
  id: string;
  userId: string;
  type: ListingType;
  status: ListingStatus;
}

@Injectable()
export class TradesService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async findAll(): Promise<TradeDetail[]> {
    const result = await this.database.query<TradeRow>(
      `
        SELECT
          trades.id::text,
          trades.listing_id::text AS "listingId",
          trades.requester_id::text AS "requesterId",
          trades.provider_id::text AS "providerId",
          trades.agreed_hours AS "agreedHours",
          trades.credit_multiplier AS "creditMultiplier",
          trades.agreed_credits AS "agreedCredits",
          trades.status::text AS status,
          trades.created_at AS "createdAt",
          trades.updated_at AS "updatedAt",
          listings.type::text AS "listingType",
          listings.title AS "listingTitle",
          listings.category AS "listingCategory",
          listings.approx_area AS "listingApproxArea",
          listings.est_hours AS "listingEstHours",
          requester.display_name AS "requesterDisplayName",
          requester.bio AS "requesterBio",
          requester.approx_area AS "requesterApproxArea",
          requester.verification_tier AS "requesterVerificationTier",
          provider.display_name AS "providerDisplayName",
          provider.bio AS "providerBio",
          provider.approx_area AS "providerApproxArea",
          provider.verification_tier AS "providerVerificationTier"
        FROM trades
        INNER JOIN listings ON listings.id = trades.listing_id
        INNER JOIN users requester ON requester.id = trades.requester_id
        INNER JOIN users provider ON provider.id = trades.provider_id
        ORDER BY trades.created_at DESC
        LIMIT 50
      `,
    );

    return result.rows.map(toTradeDetail);
  }

  async create(body: unknown): Promise<TradeDetail> {
    const input = parseCreateTradeInput(body);
    const listing = await this.findListingForProposal(input.listingId);

    if (listing.status !== "active") {
      throw new BadRequestException("Trade proposals can only be created for active listings");
    }

    if (listing.userId === input.participantId) {
      throw new BadRequestException("A profile cannot propose a trade with itself");
    }

    await this.assertProfileExists(input.participantId);

    const requesterId = listing.type === "offer" ? input.participantId : listing.userId;
    const providerId = listing.type === "offer" ? listing.userId : input.participantId;

    await this.assertNoOpenTrade(input.listingId, requesterId, providerId);

    const result = await this.database.query<{ id: string }>(
      `
        INSERT INTO trades (
          listing_id,
          requester_id,
          provider_id,
          agreed_hours
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id::text
      `,
      [input.listingId, requesterId, providerId, input.agreedHours],
    );

    return this.findById(result.rows[0].id);
  }

  async findById(id: string): Promise<TradeDetail> {
    const result = await this.database.query<TradeRow>(
      `
        SELECT
          trades.id::text,
          trades.listing_id::text AS "listingId",
          trades.requester_id::text AS "requesterId",
          trades.provider_id::text AS "providerId",
          trades.agreed_hours AS "agreedHours",
          trades.credit_multiplier AS "creditMultiplier",
          trades.agreed_credits AS "agreedCredits",
          trades.status::text AS status,
          trades.created_at AS "createdAt",
          trades.updated_at AS "updatedAt",
          listings.type::text AS "listingType",
          listings.title AS "listingTitle",
          listings.category AS "listingCategory",
          listings.approx_area AS "listingApproxArea",
          listings.est_hours AS "listingEstHours",
          requester.display_name AS "requesterDisplayName",
          requester.bio AS "requesterBio",
          requester.approx_area AS "requesterApproxArea",
          requester.verification_tier AS "requesterVerificationTier",
          provider.display_name AS "providerDisplayName",
          provider.bio AS "providerBio",
          provider.approx_area AS "providerApproxArea",
          provider.verification_tier AS "providerVerificationTier"
        FROM trades
        INNER JOIN listings ON listings.id = trades.listing_id
        INNER JOIN users requester ON requester.id = trades.requester_id
        INNER JOIN users provider ON provider.id = trades.provider_id
        WHERE trades.id = $1
      `,
      [id],
    );

    const trade = result.rows[0];

    if (!trade) {
      throw new NotFoundException("Trade not found");
    }

    return toTradeDetail(trade);
  }

  private async findListingForProposal(id: string): Promise<TradeListingRow> {
    const result = await this.database.query<TradeListingRow>(
      `
        SELECT
          id::text,
          user_id::text AS "userId",
          type::text AS type,
          status::text AS status
        FROM listings
        WHERE id = $1
      `,
      [id],
    );

    const listing = result.rows[0];

    if (!listing) {
      throw new NotFoundException("Listing not found");
    }

    return listing;
  }

  private async assertProfileExists(id: string): Promise<void> {
    const result = await this.database.query<{ id: string }>(
      `
        SELECT id::text
        FROM users
        WHERE id = $1
      `,
      [id],
    );

    if (!result.rows[0]) {
      throw new NotFoundException("Profile not found");
    }
  }

  private async assertNoOpenTrade(listingId: string, requesterId: string, providerId: string): Promise<void> {
    const result = await this.database.query<{ id: string }>(
      `
        SELECT id::text
        FROM trades
        WHERE listing_id = $1
          AND requester_id = $2
          AND provider_id = $3
          AND status IN ('proposed', 'accepted', 'in_progress')
        LIMIT 1
      `,
      [listingId, requesterId, providerId],
    );

    if (result.rows[0]) {
      throw new BadRequestException("An open trade already exists for these profiles and listing");
    }
  }
}

function parseCreateTradeInput(body: unknown): CreateTradeInput {
  if (!isRecord(body)) {
    throw new BadRequestException("Request body is required");
  }

  return {
    listingId: parseUuid(body.listingId, "listingId"),
    participantId: parseUuid(body.participantId, "participantId"),
    agreedHours: parseAgreedHours(body.agreedHours),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseUuid(value: unknown, field: string): string {
  if (typeof value === "string" && isUuid(value)) {
    return value;
  }

  throw new BadRequestException(`${field} must be a valid id`);
}

function parseAgreedHours(value: unknown): number {
  const hours = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(hours) || hours < 0.25 || hours > 24) {
    throw new BadRequestException("Agreed hours must be between 0.25 and 24");
  }

  return Math.round(hours * 100) / 100;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function toTradeDetail(row: TradeRow): TradeDetail {
  return {
    id: row.id,
    listingId: row.listingId,
    requesterId: row.requesterId,
    providerId: row.providerId,
    agreedHours: Number(row.agreedHours),
    creditMultiplier: Number(row.creditMultiplier),
    agreedCredits: Number(row.agreedCredits),
    status: row.status,
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
    listing: {
      id: row.listingId,
      type: row.listingType,
      title: row.listingTitle,
      category: row.listingCategory,
      approxArea: row.listingApproxArea,
      estHours: row.listingEstHours === null ? null : Number(row.listingEstHours),
    },
    requester: {
      id: row.requesterId,
      displayName: row.requesterDisplayName,
      bio: row.requesterBio,
      approxArea: row.requesterApproxArea,
      verificationTier: row.requesterVerificationTier,
    },
    provider: {
      id: row.providerId,
      displayName: row.providerDisplayName,
      bio: row.providerBio,
      approxArea: row.providerApproxArea,
      verificationTier: row.providerVerificationTier,
    },
  };
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
