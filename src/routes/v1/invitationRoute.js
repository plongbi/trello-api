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

// Get invitations by User
Router.route('/')
  .get(authMiddleware.isAuthorized, invitationController.getInvitations)

// Update 1 bản ghi board invitation
Router.route('/board/:invitationId')
  .put(authMiddleware.isAuthorized, invitationController.updateBoardInvitation)

export const invitationRoute = Router
