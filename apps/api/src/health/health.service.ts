import { Inject, Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service.js";

@Injectable()
export class HealthService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  getHealth() {
    return {
      service: "hourbank-api",
      status: "ok",
      checkedAt: new Date().toISOString(),
    };
  }

  async getDatabaseHealth() {
    await this.database.checkConnection();

    return {
      service: "postgres",
      status: "ok",
      checkedAt: new Date().toISOString(),
    };
  }
}
