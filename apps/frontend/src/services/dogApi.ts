import type {
  DogApiImagesResponse,
  DogApiListResponse,
  FavoriteImage,
} from "@cloudsmiths/types";

const DOG_API_BASE_URL = "https://dog.ceo/api";
const FAVORITES_API_BASE_URL =
  import.meta.env.VITE_FAVORITES_API_URL ?? "http://localhost:3333";
const BREEDS_CACHE_KEY = "cloudsmiths.cache.breeds";
const FAVORITES_CACHE_KEY = "cloudsmiths.cache.favorites";
const BREEDS_CACHE_TTL_MS = 60 * 60 * 1000;
const FAVORITES_CACHE_TTL_MS = 30 * 1000;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

let breedsMemoryCache: CacheEntry<DogApiListResponse> | null = null;
let favoritesMemoryCache: CacheEntry<FavoriteImage[]> | null = null;

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

function isCacheEntryValid<T>(
  entry: CacheEntry<T> | null,
): entry is CacheEntry<T> {
  return entry !== null && entry.expiresAt > Date.now();
}

function readCache<T>(
  key: string,
  memoryCache: CacheEntry<T> | null,
): CacheEntry<T> | null {
  if (isCacheEntryValid(memoryCache)) {
    return memoryCache;
  }

  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const rawValue = storage.getItem(key);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as CacheEntry<T>;
    return isCacheEntryValid(parsed) ? parsed : null;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

function writeCache<T>(key: string, value: T, ttlMs: number): CacheEntry<T> {
  const entry: CacheEntry<T> = {
    value,
    expiresAt: Date.now() + ttlMs,
  };

  const storage = getStorage();
  if (storage) {
    storage.setItem(key, JSON.stringify(entry));
  }

  return entry;
}

function clearCache(key: string) {
  const storage = getStorage();
  storage?.removeItem(key);
}

export async function fetchBreeds(): Promise<DogApiListResponse> {
  const cachedBreeds = readCache(BREEDS_CACHE_KEY, breedsMemoryCache);
  if (cachedBreeds) {
    breedsMemoryCache = cachedBreeds;
    return cachedBreeds.value;
  }

  const response = await fetch(`${DOG_API_BASE_URL}/breeds/list/all`);

  if (!response.ok) {
    throw new Error("Unable to load breeds.");
  }

  const data = (await response.json()) as DogApiListResponse;
  breedsMemoryCache = writeCache(BREEDS_CACHE_KEY, data, BREEDS_CACHE_TTL_MS);
  return data;
}

export async function fetchBreedRandomImages(
  breed: string,
  count: number = 3,
): Promise<DogApiImagesResponse> {
  const response = await fetch(
    `${DOG_API_BASE_URL}/breed/${breed}/images/random/${count}`,
  );

  if (!response.ok) {
    throw new Error(`Unable to load random images for ${breed}.`);
  }

  return response.json();
}

export async function fetchFavorites(): Promise<FavoriteImage[]> {
  const cachedFavorites = readCache(FAVORITES_CACHE_KEY, favoritesMemoryCache);
  if (cachedFavorites) {
    favoritesMemoryCache = cachedFavorites;
    return cachedFavorites.value;
  }

  const response = await fetch(`${FAVORITES_API_BASE_URL}/api/favorites`);

  if (!response.ok) {
    throw new Error("Unable to load favorite breeds.");
  }

  const data = (await response.json()) as { favorites: FavoriteImage[] };
  favoritesMemoryCache = writeCache(
    FAVORITES_CACHE_KEY,
    data.favorites,
    FAVORITES_CACHE_TTL_MS,
  );
  return data.favorites;
}

export async function addFavorite(
  breed: string,
  label: string,
  imageUrl: string,
): Promise<FavoriteImage[]> {
  const response = await fetch(`${FAVORITES_API_BASE_URL}/api/favorites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ breed, label, imageUrl }),
  });

  if (!response.ok) {
    throw new Error(`Unable to save ${label} as a favorite.`);
  }

  const data = (await response.json()) as { favorites: FavoriteImage[] };
  favoritesMemoryCache = writeCache(
    FAVORITES_CACHE_KEY,
    data.favorites,
    FAVORITES_CACHE_TTL_MS,
  );
  return data.favorites;
}

export async function removeFavorite(id: string): Promise<FavoriteImage[]> {
  const response = await fetch(
    `${FAVORITES_API_BASE_URL}/api/favorites/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to remove favorite breed.");
  }

  const data = (await response.json()) as { favorites: FavoriteImage[] };
  favoritesMemoryCache = writeCache(
    FAVORITES_CACHE_KEY,
    data.favorites,
    FAVORITES_CACHE_TTL_MS,
  );
  return data.favorites;
}

export function clearDogApiCaches() {
  breedsMemoryCache = null;
  favoritesMemoryCache = null;
  clearCache(BREEDS_CACHE_KEY);
  clearCache(FAVORITES_CACHE_KEY);
}

export function clearDogApiMemoryCaches() {
  breedsMemoryCache = null;
  favoritesMemoryCache = null;
}
