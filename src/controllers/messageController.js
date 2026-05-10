import { StatusCodes } from 'http-status-codes'
import { messageService } from '~/services/messageService'

const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const reqBody = { ...req.body, senderId: userId }
    const createdMessage = await messageService.createNew(reqBody)
    res.status(StatusCodes.CREATED).json(createdMessage)
  } catch (error) { next(error) }
}

const getMessages = async (req, res, next) => {
  try {
    const conversationId = req.params.conversationId
    const messages = await messageService.getMessages(conversationId)
    res.status(StatusCodes.OK).json(messages)
  } catch (error) { next(error) }
}

export const messageController = {
  createNew,
  getMessages
}
