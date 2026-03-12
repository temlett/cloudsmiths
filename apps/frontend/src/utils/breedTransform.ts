import type { BreedOption, DogApiListResponse } from "@cloudsmiths/types";

export function transformBreedResponse(
  response: DogApiListResponse,
): BreedOption[] {
  return Object.entries(response.message)
    .map(([breed, subBreeds]) => ({
      id: breed,
      label: breed.charAt(0).toUpperCase() + breed.slice(1),
      value: breed,
      subBreeds,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}
