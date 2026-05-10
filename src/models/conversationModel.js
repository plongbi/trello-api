import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const CONVERSATION_COLLECTION_NAME = 'conversations'
const CONVERSATION_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  name: Joi.string().allow(null, '').default(null),
  type: Joi.string().valid('PRIVATE', 'GROUP').default('PRIVATE'),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).min(2).required(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await CONVERSATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newConversationToAdd = {
      ...validData,
      boardId: new ObjectId(validData.boardId),
      memberIds: validData.memberIds.map(id => new ObjectId(id))
    }
    const createdConversation = await GET_DB().collection(CONVERSATION_COLLECTION_NAME).insertOne(newConversationToAdd)
    return createdConversation
  } catch (error) { throw new Error(error) }
}

const findOneById = async (conversationId) => {
  try {
    const result = await GET_DB().collection(CONVERSATION_COLLECTION_NAME).findOne({ _id: new ObjectId(conversationId) })
    return result
  } catch (error) { throw new Error(error) }
}

const getConversationsByBoardAndUser = async (boardId, userId) => {
  try {
    const result = await GET_DB().collection(CONVERSATION_COLLECTION_NAME).find({
      boardId: new ObjectId(boardId),
      memberIds: new ObjectId(userId),
      _destroy: false
    }).sort({ updatedAt: -1, createdAt: -1 }).toArray()
    return result
  } catch (error) { throw new Error(error) }
}

export const conversationModel = {
  CONVERSATION_COLLECTION_NAME,
  CONVERSATION_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getConversationsByBoardAndUser
}
