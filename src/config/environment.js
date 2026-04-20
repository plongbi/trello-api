import 'dotenv/config'

export const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,
  APP_PORT: Number(process.env.APP_PORT) || 8017,
  APP_HOST: process.env.APP_HOST || 'localhost',
  BUILD_MODE: process.env.BUILD_MODE,

  AUTHOR: process.env.AUTHOR
}