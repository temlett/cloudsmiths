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

import type { FavoriteBreedDto } from "@cloudsmiths/types";

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
  async create(@Body() payload: FavoriteBreedDto) {
    if (!payload?.breed || !payload?.label) {
      throw new BadRequestException("breed and label are required.");
    }

    const favorites = await this.favoritesService.addFavorite(payload);
    return { favorites };
  }

  @Delete(":breed")
  @HttpCode(200)
  async remove(@Param("breed") breed: string) {
    const favorites = await this.favoritesService.removeFavorite(
      decodeURIComponent(breed),
    );

    return { favorites };
  }
}
