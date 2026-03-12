import type {
  DogApiImagesResponse,
  DogApiListResponse,
  FavoriteImage,
} from "@cloudsmiths/types";

const DOG_API_BASE_URL = "https://dog.ceo/api";
const FAVORITES_API_BASE_URL =
  import.meta.env.VITE_FAVORITES_API_URL ?? "http://localhost:3333";

export async function fetchBreeds(): Promise<DogApiListResponse> {
  const response = await fetch(`${DOG_API_BASE_URL}/breeds/list/all`);

  if (!response.ok) {
    throw new Error("Unable to load breeds.");
  }

  return response.json();
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
  const response = await fetch(`${FAVORITES_API_BASE_URL}/api/favorites`);

  if (!response.ok) {
    throw new Error("Unable to load favorite breeds.");
  }

  const data = (await response.json()) as { favorites: FavoriteImage[] };
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
  return data.favorites;
}
