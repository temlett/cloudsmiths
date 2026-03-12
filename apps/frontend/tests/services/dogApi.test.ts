import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  addFavorite,
  clearDogApiCaches,
  clearDogApiMemoryCaches,
  fetchBreedRandomImages,
  fetchBreeds,
  fetchFavorites,
  removeFavorite,
} from "../../src/services/dogApi";

describe("dog api service caching", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    clearDogApiCaches();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
    clearDogApiCaches();
  });

  it("caches breeds and avoids duplicate requests", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            affenpinscher: [],
            bulldog: ["boston"],
          },
          status: "success",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const first = await fetchBreeds();
    const second = await fetchBreeds();

    expect(first).toEqual(second);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem("cloudsmiths.cache.breeds")).toContain(
      "affenpinscher",
    );
  });

  it("caches favorites and hydrates them from storage", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          favorites: [
            {
              id: "1",
              breed: "hound",
              label: "Hound",
              imageUrl: "https://example.com/hound.jpg",
              createdAt: "2026-03-12T20:00:00.000Z",
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const first = await fetchFavorites();
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    clearDogApiMemoryCaches();
    const second = await fetchFavorites();

    expect(second).toEqual(first);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("updates the favorites cache after add and remove mutations", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            favorites: [
              {
                id: "1",
                breed: "pug",
                label: "Pug",
                imageUrl: "https://example.com/pug.jpg",
                createdAt: "2026-03-12T20:00:00.000Z",
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ favorites: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const added = await addFavorite(
      "pug",
      "Pug",
      "https://example.com/pug.jpg",
    );
    clearDogApiMemoryCaches();
    const cachedAfterAdd = await fetchFavorites();

    expect(cachedAfterAdd).toEqual(added);

    const removed = await removeFavorite("1");
    clearDogApiMemoryCaches();
    const cachedAfterRemove = await fetchFavorites();

    expect(cachedAfterRemove).toEqual(removed);
  });

  it("retries dog api requests after rate limiting using retry-after", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(null, {
          status: 429,
          headers: { "Retry-After": "1" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: ["https://example.com/hound-1.jpg"],
            status: "success",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

    const requestPromise = fetchBreedRandomImages("hound", 1);

    await vi.advanceTimersByTimeAsync(1_000);

    await expect(requestPromise).resolves.toEqual({
      message: ["https://example.com/hound-1.jpg"],
      status: "success",
    });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("surfaces an error when rate limiting continues past retry attempts", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(null, {
        status: 429,
      }),
    );

    const requestPromise = fetchBreedRandomImages("hound", 1);
    const expectation = expect(requestPromise).rejects.toThrow(
      "Unable to load random images for hound.",
    );

    await vi.advanceTimersByTimeAsync(7_000);

    await expectation;
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });
});
