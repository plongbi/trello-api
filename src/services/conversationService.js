import { conversationModel } from '~/models/conversationModel'

const createNew = async (reqBody) => {
  try {
    const createdConversation = await conversationModel.createNew(reqBody)
    const getNewConversation = await conversationModel.findOneById(createdConversation.insertedId)
    return getNewConversation
  } catch (error) { throw error }
}

const getConversations = async (boardId, userId) => {
  try {
    const conversations = await conversationModel.getConversationsByBoardAndUser(boardId, userId)
    return conversations
  } catch (error) { throw error }
}

export const conversationService = {
  createNew,
  getConversations
}
