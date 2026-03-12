import { useEffect, useMemo, useState } from "react";

import {
  addFavorite,
  fetchFavorites,
  removeFavorite,
} from "../services/dogApi";
import type { BreedOption, FavoriteBreed } from "@cloudsmiths/types";

interface UseFavoritesResult {
  favorites: FavoriteBreed[];
  favoriteBreeds: Set<string>;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  toggleFavorite: (breed: BreedOption) => Promise<void>;
}

export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<FavoriteBreed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFavorites() {
      try {
        const nextFavorites = await fetchFavorites();

        if (isMounted) {
          setFavorites(nextFavorites);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load favorite breeds.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadFavorites();

    return () => {
      isMounted = false;
    };
  }, []);

  const favoriteBreeds = useMemo(
    () => new Set(favorites.map((favorite) => favorite.breed)),
    [favorites],
  );

  async function toggleFavorite(breed: BreedOption) {
    setIsUpdating(true);
    setError(null);

    try {
      const nextFavorites = favoriteBreeds.has(breed.value)
        ? await removeFavorite(breed.value)
        : await addFavorite(breed.value, breed.label);

      setFavorites(nextFavorites);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update favorite breeds.",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return {
    favorites,
    favoriteBreeds,
    isLoading,
    isUpdating,
    error,
    toggleFavorite,
  };
}
