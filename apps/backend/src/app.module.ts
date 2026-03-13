import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FavoriteEntity } from "./favorites/favorite.entity.js";
import { isPostgresStorageEnabled } from "./favorites/favorites.constants.js";
import { FavoritesModule } from "./favorites/favorites.module.js";

@Module({
  imports: [
    ...(isPostgresStorageEnabled()
      ? [
          TypeOrmModule.forRoot({
            type: "postgres",
            host: process.env.POSTGRES_HOST ?? "localhost",
            port: Number(process.env.POSTGRES_PORT ?? 5432),
            username: process.env.POSTGRES_USER ?? "cloudsmiths",
            password: process.env.POSTGRES_PASSWORD ?? "cloudsmiths",
            database: process.env.POSTGRES_DB ?? "cloudsmiths",
            entities: [FavoriteEntity],
            synchronize: true,
          }),
        ]
      : []),
    FavoritesModule,
  ],
})
export class AppModule {}
