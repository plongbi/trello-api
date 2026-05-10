import express from 'express'
import { messageValidation } from '~/validations/messageValidation'
import { messageController } from '~/controllers/messageController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, messageValidation.createNew, messageController.createNew)

Router.route('/:conversationId')
  .get(authMiddleware.isAuthorized, messageValidation.getMessages, messageController.getMessages)

export const messageRoute = Router
