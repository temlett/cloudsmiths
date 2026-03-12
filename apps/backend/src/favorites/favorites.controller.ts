import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
} from "@nestjs/common";

import type { FavoriteImageDto } from "@cloudsmiths/types";

import { FavoritesService } from "./favorites.service.js";

@Controller("api/favorites")
export class FavoritesController {
  constructor(
    @Inject(FavoritesService)
    private readonly favoritesService: FavoritesService,
  ) {}

  @Get()
  async findAll() {
    const favorites = await this.favoritesService.findAll();
    return { favorites };
  }

  @Post()
  async create(@Body() payload: FavoriteImageDto) {
    if (!payload?.breed || !payload?.label || !payload?.imageUrl) {
      throw new BadRequestException("breed, label, and imageUrl are required.");
    }

    const favorites = await this.favoritesService.addFavorite(payload);
    return { favorites };
  }

  @Delete(":id")
  @HttpCode(200)
  async remove(@Param("id") id: string) {
    const favorites = await this.favoritesService.removeFavorite(id);

    return { favorites };
  }
}
