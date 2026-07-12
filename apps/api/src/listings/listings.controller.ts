import { Controller, Get, Inject, Param, Query } from "@nestjs/common";
import { ListingsService, type ListingFilters } from "./listings.service.js";

@Controller("listings")
export class ListingsController {
  constructor(@Inject(ListingsService) private readonly listingsService: ListingsService) {}

  @Get()
  findAll(@Query() filters: ListingFilters) {
    return this.listingsService.findAll(filters);
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.listingsService.findById(id);
  }
}
