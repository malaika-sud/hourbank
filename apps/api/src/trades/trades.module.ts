import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module.js";
import { TradesController } from "./trades.controller.js";
import { TradesService } from "./trades.service.js";

@Module({
  imports: [DatabaseModule],
  controllers: [TradesController],
  providers: [TradesService],
})
export class TradesModule {}
