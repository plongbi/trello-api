import { messageModel } from '~/models/messageModel'

const createNew = async (reqBody) => {
  try {
    const createdMessage = await messageModel.createNew(reqBody)
    const getNewMessage = await messageModel.findOneById(createdMessage.insertedId)
    return getNewMessage
  } catch (error) { throw error }
}

const getMessages = async (conversationId) => {
  try {
    const messages = await messageModel.getMessagesByConversationId(conversationId)
    return messages
  } catch (error) { throw error }
}

export const messageService = {
  createNew,
  getMessages
}
