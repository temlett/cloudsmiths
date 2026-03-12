import { Injectable } from "@nestjs/common";

import type { FavoriteBreedDto, FavoriteBreedRecord } from "@cloudsmiths/types";

import { readFavorites, saveFavorites } from "./favorites.store.js";

@Injectable()
export class FavoritesService {
  async findAll(): Promise<FavoriteBreedRecord[]> {
    return readFavorites();
  }

  async addFavorite(payload: FavoriteBreedDto): Promise<FavoriteBreedRecord[]> {
    const favorites = await readFavorites();
    const existing = favorites.find(
      (favorite) => favorite.breed === payload.breed,
    );

    if (existing) {
      return favorites;
    }

    const nextFavorites = favorites.concat({
      breed: payload.breed,
      label: payload.label,
      createdAt: new Date().toISOString(),
    });

    await saveFavorites(nextFavorites);
    return nextFavorites;
  }

  async removeFavorite(breed: string): Promise<FavoriteBreedRecord[]> {
    const favorites = await readFavorites();
    const nextFavorites = favorites.filter(
      (favorite) => favorite.breed !== breed,
    );

    await saveFavorites(nextFavorites);
    return nextFavorites;
  }
}
