import { Controller, Get, Inject, Param } from "@nestjs/common";
import { WalletsService } from "./wallets.service.js";

@Controller("wallets")
export class WalletsController {
  constructor(@Inject(WalletsService) private readonly walletsService: WalletsService) {}

  @Get()
  findAll() {
    return this.walletsService.findAll();
  }

  @Get(":profileId")
  findByProfileId(@Param("profileId") profileId: string) {
    return this.walletsService.findByProfileId(profileId);
  }
}
