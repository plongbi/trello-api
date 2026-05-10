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
import socketIo from 'socket.io'
import http from 'http'
import { inviteUserToBoardSocket } from './sockets/inviteUserToBoardSocket'
import { chatSocket } from './sockets/chatSocket'

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

  // Tạo 1 cái server mới bọc app của express để làm realtime với socketio
  const server = http.createServer(app)
  const io = socketIo(server, { cors: corsOptions })
  io.on('connection', (socket) => {
    // Gọi các socket tùy theo tính năng
    inviteUserToBoardSocket(socket)
    chatSocket(socket, io)
  })

  // Môi trường Production (ví dụ Render, Heroku...)
  if (env.BUILD_MODE === 'production') {
    server.listen(process.env.PORT, () => {
      console.log(`3. Production running successfully at Port: ${process.env.PORT}`)
    })
  } else {
    // Môi trường Local Dev
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
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

