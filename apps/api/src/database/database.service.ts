import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { getApiConfig } from "../config/env.js";

export interface DatabaseClient {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: readonly unknown[],
  ): Promise<QueryResult<T>>;
}

@Injectable()
export class DatabaseService implements DatabaseClient, OnModuleDestroy {
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

  async transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      const result = await callback({
        query: (text, params = []) => client.query(text, [...params]),
      });
      await client.query("COMMIT");

      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
