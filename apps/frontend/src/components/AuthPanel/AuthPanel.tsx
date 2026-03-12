import { useEffect, useRef, useState } from "react";

import { ErrorState } from "../ErrorState";
import type { AuthenticatedUser } from "@cloudsmiths/types";
import styles from "./AuthPanel.module.css";

interface AuthPanelProps {
  user: AuthenticatedUser | null;
  isAuthenticating: boolean;
  authError: string | null;
  onSubmit: (credentials: {
    username: string;
    password: string;
  }) => Promise<void>;
  onLogout: () => void;
}

const DEMO_USERNAME = "emilys";
const DEMO_PASSWORD = "emilyspass";

export function AuthPanel({
  user,
  isAuthenticating,
  authError,
  onSubmit,
  onLogout,
}: AuthPanelProps) {
  const [username, setUsername] = useState(DEMO_USERNAME);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ username, password });
  }

  if (user) {
    return (
      <div className={styles.menuShell} ref={menuRef}>
        <button
          type="button"
          className={styles.avatarButton}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-label="Open user menu"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {user.image ? (
            <img
              className={styles.menuAvatar}
              src={user.image}
              alt={`${user.firstName} ${user.lastName}`}
            />
          ) : (
            <span className={styles.avatarFallback} aria-hidden="true">
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </span>
          )}
        </button>

        {isMenuOpen ? (
          <section
            className={styles.menuCard}
            aria-label="Authenticated user details"
          >
            <div className={styles.userSummary}>
              {user.image ? (
                <img
                  className={styles.avatar}
                  src={user.image}
                  alt={`${user.firstName} ${user.lastName}`}
                />
              ) : null}
              <div>
                <p className={styles.kicker}>Signed in</p>
                <h2 className={styles.userName}>
                  {user.firstName} {user.lastName}
                </h2>
                <p className={styles.userMeta}>
                  @{user.username} · {user.email}
                </p>
                {user.gender ? (
                  <p className={styles.userMeta}>Gender: {user.gender}</p>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              className={styles.logoutButton}
              onClick={onLogout}
            >
              Log out
            </button>
          </section>
        ) : null}
      </div>
    );
  }

  return (
    <section className={styles.loginCard} aria-label="Login form">
      <div className={styles.copy}>
        <p className={styles.kicker}>Authentication required</p>
        <h2 className={styles.heading}>Sign in to browse dog breeds</h2>
        <p className={styles.text}>
          Credentials are only used for the sign-in request, never persisted in
          browser storage, and tokens are kept in session storage with automatic
          refresh handling.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Username</span>
          <input
            className={styles.input}
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Password</span>
          <input
            className={styles.input}
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <button
          className={styles.submitButton}
          type="submit"
          disabled={isAuthenticating}
        >
          {isAuthenticating ? "Signing in..." : "Log in"}
        </button>
      </form>

      <p className={styles.hint}>
        Demo credentials are pre-filled from the DummyJSON auth API
        documentation.
      </p>

      {authError ? (
        <ErrorState
          message={authError}
          hint="Check the demo credentials or try again."
        />
      ) : null}
    </section>
  );
}
