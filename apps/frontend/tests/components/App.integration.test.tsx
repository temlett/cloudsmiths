import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  AuthSession,
  BreedOption,
  FavoriteImage,
} from "@cloudsmiths/types";

const authState = vi.hoisted(() => ({
  hydratedSession: null as AuthSession | null,
  loginResult: null as AuthSession | null,
}));

const breedsState = vi.hoisted(() => ({
  breeds: [] as BreedOption[],
  isLoading: false,
  error: null as string | null,
}));

const favoritesState = vi.hoisted(() => ({
  favorites: [] as FavoriteImage[],
  favoriteImageUrls: new Set<string>(),
  isLoading: false,
  isUpdating: false,
  loadError: null as string | null,
  updateError: null as string | null,
  toggleFavorite: vi.fn(async () => {}),
}));

const breedImagesState = vi.hoisted(() => ({
  imagesByBreed: {} as Record<string, string[]>,
  isLoading: false,
  error: null as string | null,
  refreshImages: vi.fn(async () => {}),
}));

vi.mock("../../src/services/auth", () => ({
  clearStoredSession: vi.fn(),
  getValidAccessSession: vi.fn(async (session: AuthSession) => session),
  hydrateAuthSession: vi.fn(async () => authState.hydratedSession),
  loginWithCredentials: vi.fn(async () => {
    if (!authState.loginResult) {
      throw new Error("No mocked login result configured.");
    }

    return authState.loginResult;
  }),
}));

vi.mock("../../src/hooks/useBreeds", () => ({
  useBreeds: () => breedsState,
}));

vi.mock("../../src/hooks/useFavorites", () => ({
  useFavorites: () => favoritesState,
}));

vi.mock("../../src/hooks/useBreedImages", () => ({
  useBreedImages: (breed: string | null) => ({
    images: breed ? (breedImagesState.imagesByBreed[breed] ?? []) : [],
    isLoading: breedImagesState.isLoading,
    error: breedImagesState.error,
    refreshImages: breedImagesState.refreshImages,
  }),
}));

import App from "../../src/App";

const beagle: BreedOption = {
  id: "beagle",
  label: "Beagle",
  value: "beagle",
  subBreeds: [],
};

const husky: BreedOption = {
  id: "husky",
  label: "Husky",
  value: "husky",
  subBreeds: [],
};

const session: AuthSession = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  expiresAt: Date.now() + 60_000,
  user: {
    id: 1,
    username: "emilys",
    email: "emily@example.com",
    firstName: "Emily",
    lastName: "Johnson",
  },
};

describe("App integration flows", () => {
  beforeEach(() => {
    authState.hydratedSession = null;
    authState.loginResult = session;

    breedsState.breeds = [beagle, husky];
    breedsState.isLoading = false;
    breedsState.error = null;

    favoritesState.favorites = [];
    favoritesState.favoriteImageUrls = new Set<string>();
    favoritesState.isLoading = false;
    favoritesState.isUpdating = false;
    favoritesState.loadError = null;
    favoritesState.updateError = null;
    favoritesState.toggleFavorite = vi.fn(async () => {});

    breedImagesState.imagesByBreed = {
      beagle: [
        "https://example.com/beagle-1.jpg",
        "https://example.com/beagle-2.jpg",
        "https://example.com/beagle-3.jpg",
      ],
    };
    breedImagesState.isLoading = false;
    breedImagesState.error = null;
    breedImagesState.refreshImages = vi.fn(async () => {});
  });

  it("supports login, breed browsing, and image loading", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: "Sign in to browse dog breeds",
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(
      await screen.findByRole("tab", { name: /Dog search/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Beagle/i }));

    expect(
      await screen.findByRole("heading", { name: "Beagle" }),
    ).toBeInTheDocument();
    expect(screen.getByText("3 images available")).toBeInTheDocument();
  });

  it("shows a clear empty state when breed filtering returns no matches", async () => {
    authState.hydratedSession = session;

    render(<App />);

    expect(
      await screen.findByRole("tab", { name: /Dog search/i }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "not-a-real-breed" },
    });

    expect(
      await screen.findByRole("heading", {
        name: "No breeds match “not-a-real-breed”",
      }),
    ).toBeInTheDocument();
  });

  it("shows favorites loading and update errors in the favorites tab", async () => {
    authState.hydratedSession = session;
    favoritesState.isLoading = true;
    favoritesState.loadError = "Unable to load favorite breeds.";
    favoritesState.updateError = "Unable to update favorite breeds.";

    render(<App />);

    fireEvent.click(
      await screen.findByRole("tab", { name: /Favorites gallery/i }),
    );

    expect(screen.getByText("Loading favorites...")).toBeInTheDocument();
    expect(
      screen.getByText("Unable to load favorite breeds."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Unable to update favorite breeds."),
    ).toBeInTheDocument();
  });

  it("supports navigating from the favorites tab back into breed browsing", async () => {
    authState.hydratedSession = session;
    favoritesState.favorites = [
      {
        id: "fav-1",
        breed: "beagle",
        label: "Beagle",
        imageUrl: "https://example.com/beagle-1.jpg",
        createdAt: "2026-03-13T00:00:00.000Z",
      },
    ];
    favoritesState.favoriteImageUrls = new Set([
      "https://example.com/beagle-1.jpg",
    ]);

    render(<App />);

    fireEvent.click(
      await screen.findByRole("tab", { name: /Favorites gallery/i }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Open Beagle in breed browser/i }),
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /Dog search/i })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    expect(screen.getByRole("heading", { name: "Beagle" })).toBeInTheDocument();
  });
});
