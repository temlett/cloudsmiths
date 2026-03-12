import type { DogApiImagesResponse, DogApiListResponse } from "../types/dog";

const DOG_API_BASE_URL = "https://dog.ceo/api";

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
