export const FAVORITES_STORAGE = "FAVORITES_STORAGE";

export type FavoritesStorageDriver = "file" | "postgres";

export function getFavoritesStorageDriver(): FavoritesStorageDriver {
  return process.env.FAVORITES_STORAGE === "postgres" ? "postgres" : "file";
}

export function isPostgresStorageEnabled(): boolean {
  return getFavoritesStorageDriver() === "postgres";
}
