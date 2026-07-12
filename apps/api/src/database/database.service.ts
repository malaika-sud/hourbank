import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { getApiConfig } from "../config/env.js";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: getApiConfig().databaseUrl,
  });

  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: readonly unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, [...params]);
  }

  async checkConnection(): Promise<void> {
    await this.query("SELECT 1");
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
