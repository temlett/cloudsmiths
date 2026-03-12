import { useEffect, useState } from "react";

import { fetchBreedRandomImages } from "../services/dogApi";

interface UseBreedImagesResult {
  images: string[];
  isLoading: boolean;
  error: string | null;
}

export function useBreedImages(breed: string | null): UseBreedImagesResult {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadImages(selectedBreed: string) {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchBreedRandomImages(selectedBreed);

        if (isMounted) {
          setImages(response.message);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load breed images.",
          );
          setImages([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (!breed) {
      setImages([]);
      setIsLoading(false);
      setError(null);
      return () => {
        isMounted = false;
      };
    }

    void loadImages(breed);

    return () => {
      isMounted = false;
    };
  }, [breed]);

  return { images, isLoading, error };
}
