import { StatusCodes } from 'http-status-codes'
import { conversationService } from '~/services/conversationService'

const createNew = async (req, res, next) => {
  try {
    const createdConversation = await conversationService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdConversation)
  } catch (error) { next(error) }
}

const getConversations = async (req, res, next) => {
  try {
    const boardId = req.params.boardId
    const userId = req.jwtDecoded._id
    const conversations = await conversationService.getConversations(boardId, userId)
    res.status(StatusCodes.OK).json(conversations)
  } catch (error) { next(error) }
}

export const conversationController = {
  createNew,
  getConversations
}
