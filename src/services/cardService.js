import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/coulmnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (userId, reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }
    const createdCard = await cardModel.createNew(userId, newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      // Update cardOrderIds trong collection column
      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
  } catch (error) { throw error }
}

const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      updatedCard = await cardModel.update(cardId, { cover: uploadResult.secure_url })
    }

    else if (updateData.commentToAdd) {
      // Tạo data comment để add vào DB, cần bổ sung những field cần thiết
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      }

      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)

    }

    else if (updateData.commentToUpdate) {
      updatedCard = await cardModel.updateComment(cardId, {
        userId: userInfo._id,
        commentedAt: updateData.commentToUpdate.commentedAt,
        content: updateData.commentToUpdate.content
      })
    }

    else if (updateData.commentToDelete) {
      updatedCard = await cardModel.deleteComment(cardId, {
        userId: userInfo._id,
        commentedAt: updateData.commentToDelete.commentedAt
      })
    }

    else if (updateData.incomingMemberInfo) {
      // TH ADD hoặc REMOVE member ra khỏi card
      updatedCard =await cardModel.updateMembers(cardId, updateData.incomingMemberInfo)

    }

    else {
      // Các TH update chung: title, des
      updatedCard = await cardModel.update(cardId, updateData)
    }
    return updatedCard
  } catch (error) { throw error }
}

const deleteItem = async (cardId) => {
  try {
    const targetCard = await cardModel.findOneById(cardId)
    if (!targetCard) throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!')

    // Xóa card
    await cardModel.deleteOneById(cardId)

    // Xoá cardId trong mảng cardOrderIds của column chứa nó
    await columnModel.pullCardOrderIds(targetCard)

    return { deleteResult: 'Card deleted successfully!' }
  } catch (error) { throw error }
}

export const cardService = {
  createNew,
  update,
  deleteItem
}