import { useEffect, useMemo, useState } from "react";

import {
  addFavorite,
  fetchFavorites,
  removeFavorite,
} from "../services/dogApi";
import type { FavoriteImage } from "@cloudsmiths/types";

interface UseFavoritesResult {
  favorites: FavoriteImage[];
  favoriteImageUrls: Set<string>;
  isLoading: boolean;
  isUpdating: boolean;
  loadError: string | null;
  updateError: string | null;
  toggleFavorite: (favorite: {
    breed: string;
    label: string;
    imageUrl: string;
  }) => Promise<void>;
}

export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<FavoriteImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

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
          setLoadError(
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

  const favoriteImageUrls = useMemo(
    () => new Set(favorites.map((favorite) => favorite.imageUrl)),
    [favorites],
  );

  async function toggleFavorite(favorite: {
    breed: string;
    label: string;
    imageUrl: string;
  }) {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      const existing = favorites.find(
        (item) => item.imageUrl === favorite.imageUrl,
      );
      const nextFavorites = existing
        ? await removeFavorite(existing.id)
        : await addFavorite(favorite.breed, favorite.label, favorite.imageUrl);

      setFavorites(nextFavorites);
    } catch (updateError) {
      setUpdateError(
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
    favoriteImageUrls,
    isLoading,
    isUpdating,
    loadError,
    updateError,
    toggleFavorite,
  };
}
