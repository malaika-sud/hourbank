import { Controller, Get, Inject, Param } from "@nestjs/common";
import { TradesService } from "./trades.service.js";

@Controller("trades")
export class TradesController {
  constructor(@Inject(TradesService) private readonly tradesService: TradesService) {}

  @Get()
  findAll() {
    return this.tradesService.findAll();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.tradesService.findById(id);
  }
}
