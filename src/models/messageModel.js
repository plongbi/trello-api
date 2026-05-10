import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const MESSAGE_COLLECTION_NAME = 'messages'
const MESSAGE_COLLECTION_SCHEMA = Joi.object({
  conversationId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  senderId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  content: Joi.string().required().trim(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await MESSAGE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newMessageToAdd = {
      ...validData,
      conversationId: new ObjectId(validData.conversationId),
      senderId: new ObjectId(validData.senderId)
    }
    const createdMessage = await GET_DB().collection(MESSAGE_COLLECTION_NAME).insertOne(newMessageToAdd)
    return createdMessage
  } catch (error) { throw new Error(error) }
}

const findOneById = async (messageId) => {
  try {
    const result = await GET_DB().collection(MESSAGE_COLLECTION_NAME).findOne({ _id: new ObjectId(messageId) })
    return result
  } catch (error) { throw new Error(error) }
}

const getMessagesByConversationId = async (conversationId) => {
  try {
    const result = await GET_DB().collection(MESSAGE_COLLECTION_NAME).find({
      conversationId: new ObjectId(conversationId),
      _destroy: false
    }).sort({ createdAt: 1 }).toArray() // Sort ascending for chat
    return result
  } catch (error) { throw new Error(error) }
}

export const messageModel = {
  MESSAGE_COLLECTION_NAME,
  MESSAGE_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getMessagesByConversationId
}
