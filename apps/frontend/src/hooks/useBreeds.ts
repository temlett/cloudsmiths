import { useEffect, useState } from "react";

import type { BreedOption } from "@cloudsmiths/types";

import { fetchBreeds } from "../services/dogApi";
import { transformBreedResponse } from "../utils/breedTransform";

interface UseBreedsResult {
  breeds: BreedOption[];
  isLoading: boolean;
  error: string | null;
}

export function useBreeds(): UseBreedsResult {
  const [breeds, setBreeds] = useState<BreedOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBreeds() {
      try {
        const response = await fetchBreeds();

        if (isMounted) {
          setBreeds(transformBreedResponse(response));
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load breeds.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadBreeds();

    return () => {
      isMounted = false;
    };
  }, []);

  return { breeds, isLoading, error };
}
