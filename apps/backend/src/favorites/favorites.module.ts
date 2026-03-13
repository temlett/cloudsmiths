import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FavoriteEntity } from "./favorite.entity.js";
import {
  FAVORITES_STORAGE,
  isPostgresStorageEnabled,
} from "./favorites.constants.js";
import { FavoritesController } from "./favorites.controller.js";
import { FavoritesFileRepository } from "./favorites-file.repository.js";
import { FavoritesPostgresRepository } from "./favorites-postgres.repository.js";
import { FavoritesService } from "./favorites.service.js";

@Module({
  imports: isPostgresStorageEnabled()
    ? [TypeOrmModule.forFeature([FavoriteEntity])]
    : [],
  controllers: [FavoritesController],
  providers: isPostgresStorageEnabled()
    ? [
        FavoritesService,
        FavoritesPostgresRepository,
        {
          provide: FAVORITES_STORAGE,
          useExisting: FavoritesPostgresRepository,
        },
      ]
    : [
        FavoritesService,
        FavoritesFileRepository,
        {
          provide: FAVORITES_STORAGE,
          useExisting: FavoritesFileRepository,
        },
      ],
})
export class FavoritesModule {}
