import { Inject, Injectable } from "@nestjs/common";

import type { FavoriteImage, FavoriteImageDto } from "@cloudsmiths/types";

import { FAVORITES_STORAGE } from "./favorites.constants.js";
import type { FavoritesRepository } from "./favorites.repository.js";

@Injectable()
export class FavoritesService {
  constructor(
    @Inject(FAVORITES_STORAGE)
    private readonly favoritesRepository: FavoritesRepository,
  ) {}

  async findAll(): Promise<FavoriteImage[]> {
    return this.favoritesRepository.findAll();
  }

  async addFavorite(payload: FavoriteImageDto): Promise<FavoriteImage[]> {
    return this.favoritesRepository.addFavorite(payload);
  }

  async removeFavorite(id: string): Promise<FavoriteImage[]> {
    return this.favoritesRepository.removeFavorite(id);
  }
}
