/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions } from './config/cors'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import exitHook from 'async-exit-hook'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import cookieParser from 'cookie-parser'

const START_SERVER = () => {
  const app = express()

  // Fix cache from disk của expressjs
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  // Cấu hình Cookie Parser
  app.use(cookieParser())

  // Xử lý CORS
  app.use(cors(corsOptions))

  // Enable req.body json data
  app.use(express.json())

  // Use API v1
  app.use('/v1', APIs_V1)

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  // Môi trường production
  if (env.NODE_ENV === 'production') {
    app.listen(process.env.PORT, () => {
      console.log(`3. Production running successfully at Port: ${process.env.PORT}`)
    })
  } else {
    // Môi trường local dev
    app.listen(Number(env.LOCAL_DEV_APP_PORT), env.LOCAL_DEV_APP_HOST, () => {
      console.log(`3. Local dev running successfully at Host: ${env.LOCAL_DEV_APP_HOST} and Port: ${env.LOCAL_DEV_APP_PORT}`)
    })
  }

  exitHook(() => {
    console.log('4. Disconnecting...')
    CLOSE_DB()
    console.log('5. Disconnected')
  })
}

// Chỉ khi kết nối db thành công mới start server backend
(async () => {
  try {
    console.log('1. Connecting...')
    await CONNECT_DB()
    console.log('2. Connected')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()

