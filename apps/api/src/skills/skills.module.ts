import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module.js";
import { SkillsController } from "./skills.controller.js";
import { SkillsService } from "./skills.service.js";

@Module({
  imports: [DatabaseModule],
  controllers: [SkillsController],
  providers: [SkillsService],
})
export class SkillsModule {}
