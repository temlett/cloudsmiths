/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BACKEND_API_URL?: string;
  readonly AUTH_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
