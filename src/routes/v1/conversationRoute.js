import express from 'express'
import { conversationValidation } from '~/validations/conversationValidation'
import { conversationController } from '~/controllers/conversationController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, conversationValidation.createNew, conversationController.createNew)

Router.route('/:boardId')
  .get(authMiddleware.isAuthorized, conversationValidation.getConversations, conversationController.getConversations)

export const conversationRoute = Router
