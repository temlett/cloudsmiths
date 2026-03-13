import { Injectable } from "@nestjs/common";

import type { FavoriteImage, FavoriteImageDto } from "@cloudsmiths/types";

import { readFavorites, saveFavorites } from "./favorites.store.js";
import type { FavoritesRepository } from "./favorites.repository.js";

@Injectable()
export class FavoritesFileRepository implements FavoritesRepository {
  async findAll(): Promise<FavoriteImage[]> {
    return readFavorites();
  }

  async addFavorite(payload: FavoriteImageDto): Promise<FavoriteImage[]> {
    const favorites = await readFavorites();
    const existing = favorites.find(
      (favorite) => favorite.imageUrl === payload.imageUrl,
    );

    if (existing) {
      return favorites;
    }

    const nextFavorites = favorites.concat({
      id: crypto.randomUUID(),
      breed: payload.breed,
      label: payload.label,
      imageUrl: payload.imageUrl,
      createdAt: new Date().toISOString(),
    });

    await saveFavorites(nextFavorites);
    return nextFavorites;
  }

  async removeFavorite(id: string): Promise<FavoriteImage[]> {
    const favorites = await readFavorites();
    const nextFavorites = favorites.filter((favorite) => favorite.id !== id);

    await saveFavorites(nextFavorites);
    return nextFavorites;
  }
}
