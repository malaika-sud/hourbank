import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module.js";
import { WalletsController } from "./wallets.controller.js";
import { WalletsService } from "./wallets.service.js";

@Module({
  imports: [DatabaseModule],
  controllers: [WalletsController],
  providers: [WalletsService],
})
export class WalletsModule {}
