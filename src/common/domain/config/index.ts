export interface ConfigBase {
  NODE_ENV: string;

  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;

  isDebug: boolean;
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
}
