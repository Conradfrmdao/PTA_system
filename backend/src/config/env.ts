type Environment = {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  DATABASE_URL: string;
  FRONTEND_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  ACCESS_TOKEN_TTL: string;
  REFRESH_TOKEN_TTL_DAYS: number;
};

const required = (config: Record<string, unknown>, key: string): string => {
  const value = config[key];
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${key} is required`);
  return value;
};

export const validateEnvironment = (config: Record<string, unknown>): Environment => {
  const accessSecret = required(config, 'JWT_ACCESS_SECRET');
  const refreshSecret = required(config, 'JWT_REFRESH_SECRET');
  if (accessSecret.length < 32 || refreshSecret.length < 32) {
    throw new Error('JWT secrets must contain at least 32 characters');
  }

  return {
    NODE_ENV: (config['NODE_ENV'] as Environment['NODE_ENV']) ?? 'development',
    PORT: Number(config['PORT'] ?? 4000),
    DATABASE_URL: required(config, 'DATABASE_URL'),
    FRONTEND_URL: required(config, 'FRONTEND_URL'),
    JWT_ACCESS_SECRET: accessSecret,
    JWT_REFRESH_SECRET: refreshSecret,
    ACCESS_TOKEN_TTL: typeof config['ACCESS_TOKEN_TTL'] === 'string' ? config['ACCESS_TOKEN_TTL'] : '15m',
    REFRESH_TOKEN_TTL_DAYS: Number(config['REFRESH_TOKEN_TTL_DAYS'] ?? 7),
  };
};
