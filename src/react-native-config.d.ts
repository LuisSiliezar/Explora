declare module 'react-native-config' {
  /** Raw values from .env.<environment>. Always read them through `env` in @config/env (validated). */
  export interface NativeConfig {
    APP_ENV?: string;
    APP_DISPLAY_NAME?: string;
    APP_BUNDLE_ID?: string;
    APP_URL_SCHEME?: string;
    API_URL?: string;
    API_TIMEOUT_MS?: string;
    DEV_SEED_MULTIPLIER?: string;
  }
  const Config: NativeConfig;
  export default Config;
}
