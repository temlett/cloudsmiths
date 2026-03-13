import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { FavoriteImage, FavoriteImageDto } from "@cloudsmiths/types";
import { Repository } from "typeorm";

import { FavoriteEntity } from "./favorite.entity.js";
import type { FavoritesRepository } from "./favorites.repository.js";

function mapFavorite(entity: FavoriteEntity): FavoriteImage {
  return {
    id: entity.id,
    breed: entity.breed,
    label: entity.label,
    imageUrl: entity.imageUrl,
    createdAt: entity.createdAt.toISOString(),
  };
}

@Injectable()
export class FavoritesPostgresRepository implements FavoritesRepository {
  constructor(
    @InjectRepository(FavoriteEntity)
    private readonly favoritesRepository: Repository<FavoriteEntity>,
  ) {}

  async findAll(): Promise<FavoriteImage[]> {
    const favorites = await this.favoritesRepository.find({
      order: {
        createdAt: "DESC",
        label: "ASC",
      },
    });

    return favorites.map(mapFavorite);
  }

  async addFavorite(payload: FavoriteImageDto): Promise<FavoriteImage[]> {
    const existing = await this.favoritesRepository.findOne({
      where: { imageUrl: payload.imageUrl },
    });

    if (!existing) {
      await this.favoritesRepository.save(
        this.favoritesRepository.create({
          id: crypto.randomUUID(),
          breed: payload.breed,
          label: payload.label,
          imageUrl: payload.imageUrl,
          createdAt: new Date(),
        }),
      );
    }

    return this.findAll();
  }

  async removeFavorite(id: string): Promise<FavoriteImage[]> {
    await this.favoritesRepository.delete({ id });
    return this.findAll();
  }
}
