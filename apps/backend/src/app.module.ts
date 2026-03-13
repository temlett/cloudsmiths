import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FavoriteEntity } from "./favorites/favorite.entity.js";
import { isPostgresStorageEnabled } from "./favorites/favorites.constants.js";
import { FavoritesModule } from "./favorites/favorites.module.js";

function isDatabaseSslEnabled(): boolean {
  if (process.env.DATABASE_SSL === "true") {
    return true;
  }

  if (process.env.DATABASE_SSL === "false") {
    return false;
  }

  return Boolean(process.env.DATABASE_URL);
}

function createTypeOrmConfig() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    return {
      type: "postgres" as const,
      url: databaseUrl,
      ssl: isDatabaseSslEnabled() ? { rejectUnauthorized: false } : false,
      entities: [FavoriteEntity],
      synchronize: true,
    };
  }

  return {
    type: "postgres" as const,
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    username: process.env.POSTGRES_USER ?? "cloudsmiths",
    password: process.env.POSTGRES_PASSWORD ?? "cloudsmiths",
    database: process.env.POSTGRES_DB ?? "cloudsmiths",
    ssl: isDatabaseSslEnabled() ? { rejectUnauthorized: false } : false,
    entities: [FavoriteEntity],
    synchronize: true,
  };
}

@Module({
  imports: [
    ...(isPostgresStorageEnabled()
      ? [TypeOrmModule.forRoot(createTypeOrmConfig())]
      : []),
    FavoritesModule,
  ],
})
export class AppModule {}
