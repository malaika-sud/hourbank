import { Controller, Get, Inject } from "@nestjs/common";
import { SkillsService } from "./skills.service.js";

@Controller("skills")
export class SkillsController {
  constructor(@Inject(SkillsService) private readonly skillsService: SkillsService) {}

  @Get()
  findAll() {
    return this.skillsService.findAll();
  }
}
