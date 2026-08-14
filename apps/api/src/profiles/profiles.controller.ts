import { Body, Controller, Get, Inject, Param, Patch } from "@nestjs/common";
import { ProfilesService } from "./profiles.service.js";

@Controller("profiles")
export class ProfilesController {
  constructor(@Inject(ProfilesService) private readonly profilesService: ProfilesService) {}

  @Get()
  findAll() {
    return this.profilesService.findAll();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.profilesService.findById(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown) {
    return this.profilesService.update(id, body);
  }
}
