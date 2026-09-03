import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module.js";
import { HealthModule } from "./health/health.module.js";
import { ListingsModule } from "./listings/listings.module.js";
import { ProfilesModule } from "./profiles/profiles.module.js";
import { SkillsModule } from "./skills/skills.module.js";
import { TradesModule } from "./trades/trades.module.js";
import { WalletsModule } from "./wallets/wallets.module.js";

@Module({
  imports: [DatabaseModule, HealthModule, ListingsModule, ProfilesModule, SkillsModule, TradesModule, WalletsModule],
})
export class AppModule {}
