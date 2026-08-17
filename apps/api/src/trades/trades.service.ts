import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ListingType, TradeDetail, TradeStatus } from "@hourbank/shared";
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
