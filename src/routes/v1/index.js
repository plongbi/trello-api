import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute'
import { columnRoute } from './columnRoute'
import { cardRoute } from './cardRoute'
import { userRoute } from './userRoute'
import { invitationRoute } from './invitationRoute'
import { chatbotRoute } from './chatbotRoute'
import { conversationRoute } from './conversationRoute'
import { messageRoute } from './messageRoute'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'API is running' })
})

// Board API
Router.use('/boards', boardRoute)

// Column API
Router.use('/columns', columnRoute)

// Card API
Router.use('/cards', cardRoute)

// User API
Router.use('/users', userRoute)

// Invitation API
Router.use('/invitations', invitationRoute)

// Chatbot AI API
Router.use('/chatbot', chatbotRoute)

// Chat API
Router.use('/conversations', conversationRoute)
Router.use('/messages', messageRoute)

export const APIs_V1 = Router