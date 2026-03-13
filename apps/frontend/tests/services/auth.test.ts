import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearStoredSession,
  hydrateAuthSession,
  loginWithCredentials,
  restoreStoredSession,
} from "../../src/services/auth";

describe("auth service", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("stores tokens and user details without persisting the password", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 1,
          username: "emilys",
          email: "emily@example.com",
          firstName: "Emily",
          lastName: "Johnson",
          image: "https://example.com/avatar.png",
          accessToken: "access-token",
          refreshToken: "refresh-token",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const session = await loginWithCredentials("emilys", "emilyspass");
    const rawStoredSession = sessionStorage.getItem("cloudsmiths.auth.session");

    expect(session.accessToken).toBe("access-token");
    expect(session.refreshToken).toBe("refresh-token");
    expect(rawStoredSession).toContain("access-token");
    expect(rawStoredSession).toContain("refresh-token");
    expect(rawStoredSession).not.toContain("emilyspass");
  });

  it("refreshes an expired stored session during hydration", async () => {
    sessionStorage.setItem(
      "cloudsmiths.auth.session",
      JSON.stringify({
        accessToken: "expired-token",
        refreshToken: "refresh-token",
        expiresAt: Date.now() - 1_000,
        user: {
          id: 1,
          username: "emilys",
          email: "emily@example.com",
          firstName: "Emily",
          lastName: "Johnson",
        },
      }),
    );

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            accessToken: "fresh-token",
            refreshToken: "fresh-refresh-token",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 1,
            username: "emilys",
            email: "emily@example.com",
            firstName: "Emily",
            lastName: "Johnson",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

    const session = await hydrateAuthSession();

    expect(session?.accessToken).toBe("fresh-token");
    expect(session?.refreshToken).toBe("fresh-refresh-token");
    expect(restoreStoredSession()?.accessToken).toBe("fresh-token");
  });

  it("clears invalid stored session data", () => {
    sessionStorage.setItem("cloudsmiths.auth.session", "{invalid-json");

    expect(restoreStoredSession()).toBeNull();

    clearStoredSession();
    expect(sessionStorage.getItem("cloudsmiths.auth.session")).toBeNull();
  });
});
