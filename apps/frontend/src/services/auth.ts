import type { AuthSession, AuthenticatedUser } from "@cloudsmiths/types";

const AUTH_API_BASE_URL =
  import.meta.env.AUTH_BASE_URL ?? "https://dummyjson.com/auth";
const AUTH_STORAGE_KEY = "cloudsmiths.auth.session";
const DEFAULT_TOKEN_LIFETIME_MINUTES = 30;
const TOKEN_REFRESH_BUFFER_MS = 30 * 1000;

interface LoginResponse extends AuthenticatedUser {
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

function calculateExpiry(expiresInMins?: number): number {
  return (
    Date.now() + (expiresInMins ?? DEFAULT_TOKEN_LIFETIME_MINUTES) * 60 * 1000
  );
}

function persistSession(session: AuthSession) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function buildSession(
  payload: LoginResponse,
  expiresInMins?: number,
  refreshTokenOverride?: string,
): AuthSession {
  return {
    accessToken: payload.accessToken,
    refreshToken: refreshTokenOverride ?? payload.refreshToken,
    expiresAt: calculateExpiry(expiresInMins),
    user: {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      gender: payload.gender,
      image: payload.image,
    },
  };
}

export function clearStoredSession() {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(AUTH_STORAGE_KEY);
}

export function restoreStoredSession(): AuthSession | null {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const rawValue = storage.getItem(AUTH_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as AuthSession;

    if (
      !parsed.accessToken ||
      !parsed.refreshToken ||
      !parsed.expiresAt ||
      !parsed.user
    ) {
      clearStoredSession();
      return null;
    }

    return parsed;
  } catch {
    clearStoredSession();
    return null;
  }
}

function isSessionExpired(session: AuthSession): boolean {
  return session.expiresAt <= Date.now() + TOKEN_REFRESH_BUFFER_MS;
}

async function parseErrorMessage(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function loginWithCredentials(
  username: string,
  password: string,
  expiresInMins: number = DEFAULT_TOKEN_LIFETIME_MINUTES,
): Promise<AuthSession> {
  const response = await fetch(`${AUTH_API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password, expiresInMins }),
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(
        response,
        "Unable to sign in with those credentials.",
      ),
    );
  }

  const payload = (await response.json()) as LoginResponse;
  const session = buildSession(payload, expiresInMins);
  persistSession(session);
  return session;
}

export async function fetchAuthenticatedUser(accessToken: string) {
  const response = await fetch(`${AUTH_API_BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(response, "Unable to load your profile."),
    );
  }

  return (await response.json()) as AuthenticatedUser;
}

export async function refreshAuthSession(
  refreshToken: string,
  currentUser: AuthenticatedUser,
  expiresInMins: number = DEFAULT_TOKEN_LIFETIME_MINUTES,
): Promise<AuthSession> {
  const response = await fetch(`${AUTH_API_BASE_URL}/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken, expiresInMins }),
  });

  if (!response.ok) {
    clearStoredSession();
    throw new Error(
      await parseErrorMessage(
        response,
        "Your session has expired. Please sign in again.",
      ),
    );
  }

  const payload = (await response.json()) as RefreshResponse;
  const session: AuthSession = {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken ?? refreshToken,
    expiresAt: calculateExpiry(expiresInMins),
    user: currentUser,
  };

  persistSession(session);
  return session;
}

export async function hydrateAuthSession(): Promise<AuthSession | null> {
  const storedSession = restoreStoredSession();

  if (!storedSession) {
    return null;
  }

  try {
    const activeSession = isSessionExpired(storedSession)
      ? await refreshAuthSession(storedSession.refreshToken, storedSession.user)
      : storedSession;

    const user = await fetchAuthenticatedUser(activeSession.accessToken);
    const hydratedSession = {
      ...activeSession,
      user,
    };

    persistSession(hydratedSession);
    return hydratedSession;
  } catch {
    clearStoredSession();
    return null;
  }
}

export async function getValidAccessSession(
  session: AuthSession,
): Promise<AuthSession> {
  if (!isSessionExpired(session)) {
    return session;
  }

  return refreshAuthSession(session.refreshToken, session.user);
}
