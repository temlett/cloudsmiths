import { useEffect, useState } from "react";

import { fetchBreedRandomImages } from "../services/dogApi";

interface UseBreedImagesResult {
  images: string[];
  cachedImages: Record<string, string[]>;
  isLoading: boolean;
  error: string | null;
  refreshImages: () => Promise<void>;
}

export function useBreedImages(breed: string | null): UseBreedImagesResult {
  const [images, setImages] = useState<string[]>([]);
  const [cachedImages, setCachedImages] = useState<Record<string, string[]>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadImages(selectedBreed: string, forceRefresh = false) {
    if (!forceRefresh && cachedImages[selectedBreed]) {
      setImages(cachedImages[selectedBreed]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchBreedRandomImages(selectedBreed);

      setImages(response.message);
      setCachedImages((current) => ({
        ...current,
        [selectedBreed]: response.message,
      }));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load breed images.",
      );
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function syncImages(selectedBreed: string) {
      await loadImages(selectedBreed);

      if (!isMounted) {
        return;
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

    void syncImages(breed);

    return () => {
      isMounted = false;
    };
  }, [breed, cachedImages]);

  async function refreshImages() {
    if (!breed) {
      return;
    }

    await loadImages(breed, true);
  }

  return { images, cachedImages, isLoading, error, refreshImages };
}
