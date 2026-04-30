import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { invitationController } from '~/controllers/invitationController'
import { invitationValidation } from '~/validations/invitationValidation'

const Router = express.Router()

Router.route('/board')
  .post(
    authMiddleware.isAuthorized,
    invitationValidation.createNewBoardInvitation,
    invitationController.createNewBoardInvitation
  )

export const invitationRoute = Router
