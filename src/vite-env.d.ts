interface ImportMetaEnv {
  readonly VITE_ATPROTO_CLIENT_ID?: string
  readonly VITE_HMR_CLIENT_PORT?: string
  readonly VITE_HMR_HOST?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
