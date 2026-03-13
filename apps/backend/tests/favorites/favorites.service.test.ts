import { beforeEach, describe, expect, it, vi } from "vitest";

import { FavoritesService } from "../../src/favorites/favorites.service.js";
import type { FavoritesRepository } from "../../src/favorites/favorites.repository.js";

describe("FavoritesService", () => {
  const repository: FavoritesRepository = {
    findAll: vi.fn(async () => []),
    addFavorite: vi.fn(async () => []),
    removeFavorite: vi.fn(async () => []),
  };

  const service = new FavoritesService(repository as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns favorites from the store", async () => {
    vi.mocked(repository.findAll).mockResolvedValue([
      {
        id: "fav-1",
        breed: "beagle",
        label: "Beagle",
        imageUrl: "https://images.example/beagle-1.jpg",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    await expect(service.findAll()).resolves.toEqual([
      {
        id: "fav-1",
        breed: "beagle",
        label: "Beagle",
        imageUrl: "https://images.example/beagle-1.jpg",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
  });

  it("adds a new favorite when it does not already exist", async () => {
    vi.mocked(repository.addFavorite).mockResolvedValue([
      {
        id: "generated-id",
        breed: "pug",
        label: "Pug",
        imageUrl: "https://images.example/pug-1.jpg",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    const result = await service.addFavorite({
      breed: "pug",
      label: "Pug",
      imageUrl: "https://images.example/pug-1.jpg",
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      breed: "pug",
      label: "Pug",
      imageUrl: "https://images.example/pug-1.jpg",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    expect(repository.addFavorite).toHaveBeenCalledTimes(1);
  });

  it("does not duplicate an existing favorite", async () => {
    const existing = [
      {
        id: "fav-2",
        breed: "pug",
        label: "Pug",
        imageUrl: "https://images.example/pug-1.jpg",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    vi.mocked(repository.addFavorite).mockResolvedValue(existing);

    const result = await service.addFavorite({
      breed: "pug",
      label: "Pug",
      imageUrl: "https://images.example/pug-1.jpg",
    });

    expect(result).toEqual(existing);
    expect(repository.addFavorite).toHaveBeenCalledTimes(1);
  });

  it("removes a favorite by breed", async () => {
    vi.mocked(repository.removeFavorite).mockResolvedValue([
      {
        id: "fav-3",
        breed: "beagle",
        label: "Beagle",
        imageUrl: "https://images.example/beagle-1.jpg",
        createdAt: "2026-01-02T00:00:00.000Z",
      },
    ]);

    const result = await service.removeFavorite("fav-2");

    expect(result).toEqual([
      {
        id: "fav-3",
        breed: "beagle",
        label: "Beagle",
        imageUrl: "https://images.example/beagle-1.jpg",
        createdAt: "2026-01-02T00:00:00.000Z",
      },
    ]);
    expect(repository.removeFavorite).toHaveBeenCalledWith("fav-2");
  });
});
