import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module.js";
import { HealthModule } from "./health/health.module.js";
import { ListingsModule } from "./listings/listings.module.js";
import { ProfilesModule } from "./profiles/profiles.module.js";

@Module({
  imports: [DatabaseModule, HealthModule, ListingsModule, ProfilesModule],
})
export class AppModule {}
