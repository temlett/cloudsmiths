import type { FavoriteImage, FavoriteImageDto } from "@cloudsmiths/types";

export interface FavoritesRepository {
  findAll(): Promise<FavoriteImage[]>;
  addFavorite(payload: FavoriteImageDto): Promise<FavoriteImage[]>;
  removeFavorite(id: string): Promise<FavoriteImage[]>;
}
