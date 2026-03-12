import { Module } from "@nestjs/common";

import { FavoritesModule } from "./favorites/favorites.module.js";

@Module({
  imports: [FavoritesModule],
})
export class AppModule {}
