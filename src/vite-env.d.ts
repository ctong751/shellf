interface ImportMetaEnv {
  readonly VITE_HMR_CLIENT_PORT?: string
  readonly VITE_HMR_HOST?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
