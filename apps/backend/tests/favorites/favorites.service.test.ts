import { beforeEach, describe, expect, it, vi } from "vitest";

import { FavoritesService } from "../../src/favorites/favorites.service.js";
import * as store from "../../src/favorites/favorites.store.js";

vi.mock("../../src/favorites/favorites.store.js", () => ({
  readFavorites: vi.fn(),
  saveFavorites: vi.fn(),
}));

describe("FavoritesService", () => {
  const service = new FavoritesService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns favorites from the store", async () => {
    vi.mocked(store.readFavorites).mockResolvedValue([
      {
        breed: "beagle",
        label: "Beagle",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    await expect(service.findAll()).resolves.toEqual([
      {
        breed: "beagle",
        label: "Beagle",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
  });

  it("adds a new favorite when it does not already exist", async () => {
    vi.mocked(store.readFavorites).mockResolvedValue([]);
    vi.mocked(store.saveFavorites).mockResolvedValue(undefined);

    const result = await service.addFavorite({ breed: "pug", label: "Pug" });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ breed: "pug", label: "Pug" });
    expect(store.saveFavorites).toHaveBeenCalledTimes(1);
  });

  it("does not duplicate an existing favorite", async () => {
    const existing = [
      { breed: "pug", label: "Pug", createdAt: "2026-01-01T00:00:00.000Z" },
    ];
    vi.mocked(store.readFavorites).mockResolvedValue(existing);

    const result = await service.addFavorite({ breed: "pug", label: "Pug" });

    expect(result).toEqual(existing);
    expect(store.saveFavorites).not.toHaveBeenCalled();
  });

  it("removes a favorite by breed", async () => {
    vi.mocked(store.readFavorites).mockResolvedValue([
      { breed: "pug", label: "Pug", createdAt: "2026-01-01T00:00:00.000Z" },
      {
        breed: "beagle",
        label: "Beagle",
        createdAt: "2026-01-02T00:00:00.000Z",
      },
    ]);
    vi.mocked(store.saveFavorites).mockResolvedValue(undefined);

    const result = await service.removeFavorite("pug");

    expect(result).toEqual([
      {
        breed: "beagle",
        label: "Beagle",
        createdAt: "2026-01-02T00:00:00.000Z",
      },
    ]);
    expect(store.saveFavorites).toHaveBeenCalledWith(result);
  });
});
