import express from 'express'
import { chatbotController } from '~/controllers/chatbotController'

const Router = express.Router()

// POST /v1/chatbot/chat
Router.route('/chat').post(chatbotController.chat)

export const chatbotRoute = Router
