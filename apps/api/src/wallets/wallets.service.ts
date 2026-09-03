import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { LedgerTransactionKind, WalletDetail, WalletEntrySummary, WalletSummary } from "@hourbank/shared";
import { DatabaseService } from "../database/database.service.js";

interface WalletRow {
  profileId: string;
  displayName: string;
  bio: string | null;
  approxArea: string;
  verificationTier: number;
  accountId: string | null;
  availableBalance: string | number | null;
}

interface WalletEntryRow {
  transactionId: string;
  kind: LedgerTransactionKind;
  amount: string | number;
  createdAt: Date | string;
}

@Injectable()
export class WalletsService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async findAll(): Promise<WalletSummary[]> {
    const result = await this.database.query<WalletRow>(
      `
        SELECT
          users.id::text AS "profileId",
          users.display_name AS "displayName",
          users.bio,
          users.approx_area AS "approxArea",
          users.verification_tier AS "verificationTier",
          ledger_accounts.id::text AS "accountId",
          COALESCE(ledger_account_balances.balance, 0) AS "availableBalance"
        FROM users
        LEFT JOIN ledger_accounts
          ON ledger_accounts.owner_type = 'user'
          AND ledger_accounts.owner_ref = users.id::text
          AND ledger_accounts.kind = 'available'
        LEFT JOIN ledger_account_balances
          ON ledger_account_balances.account_id = ledger_accounts.id
        ORDER BY users.display_name ASC
        LIMIT 50
      `,
    );

    return result.rows.map(toWalletSummary);
  }

  async findByProfileId(profileId: string): Promise<WalletDetail> {
    const result = await this.database.query<WalletRow>(
      `
        SELECT
          users.id::text AS "profileId",
          users.display_name AS "displayName",
          users.bio,
          users.approx_area AS "approxArea",
          users.verification_tier AS "verificationTier",
          ledger_accounts.id::text AS "accountId",
          COALESCE(ledger_account_balances.balance, 0) AS "availableBalance"
        FROM users
        LEFT JOIN ledger_accounts
          ON ledger_accounts.owner_type = 'user'
          AND ledger_accounts.owner_ref = users.id::text
          AND ledger_accounts.kind = 'available'
        LEFT JOIN ledger_account_balances
          ON ledger_account_balances.account_id = ledger_accounts.id
        WHERE users.id = $1
      `,
      [profileId],
    );

    const wallet = result.rows[0];

    if (!wallet) {
      throw new NotFoundException("Wallet not found");
    }

    return {
      ...toWalletSummary(wallet),
      entries: wallet.accountId ? await this.findEntries(wallet.accountId) : [],
    };
  }

  private async findEntries(accountId: string): Promise<WalletEntrySummary[]> {
    const result = await this.database.query<WalletEntryRow>(
      `
        SELECT
          ledger_transactions.id::text AS "transactionId",
          ledger_transactions.kind::text AS kind,
          ledger_entries.amount,
          ledger_transactions.created_at AS "createdAt"
        FROM ledger_entries
        INNER JOIN ledger_transactions
          ON ledger_transactions.id = ledger_entries.transaction_id
        WHERE ledger_entries.account_id = $1
        ORDER BY ledger_transactions.created_at DESC
        LIMIT 25
      `,
      [accountId],
    );

    return result.rows.map((entry) => ({
      transactionId: entry.transactionId,
      kind: entry.kind,
      amount: Number(entry.amount),
      createdAt: toIsoString(entry.createdAt),
    }));
  }
}

function toWalletSummary(row: WalletRow): WalletSummary {
  return {
    profile: {
      id: row.profileId,
      displayName: row.displayName,
      bio: row.bio,
      approxArea: row.approxArea,
      verificationTier: row.verificationTier,
    },
    accountId: row.accountId,
    availableBalance: row.availableBalance === null ? 0 : Number(row.availableBalance),
  };
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
