/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_BASE_URL_LOCAL?: string
  readonly VITE_API_BASE_URL_NETWORK?: string
  readonly VITE_API_BASE_URL_TAILSCALE?: string
  readonly VITE_API_ROOT_URL?: string
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 