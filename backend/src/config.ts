export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'soltrisk',
    user: process.env.DB_USER || 'soltrisk',
    password: process.env.DB_PASSWORD || 'soltrisk_bench_2024',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'soltrisk-secret-key-2024',
    accessExpiresIn: 900,
    refreshExpiresIn: 604800,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://app.krizznaa.tech',
  },
};
