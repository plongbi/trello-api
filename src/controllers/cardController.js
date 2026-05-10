import { StatusCodes } from 'http-status-codes'
import { cardService } from '../services/cardService.js'

const createNew = async(req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const createdCard = await cardService.createNew(userId, req.body)
    res.status(StatusCodes.CREATED).json(createdCard)
  } catch (error) { next(error) }
}

const update = async(req, res, next) => {
  try {
    const cardId = req.params.id
    const cardCoverFile = req.file
    const userInfo = req.jwtDecoded
    const updatedCard = await cardService.update(cardId, req.body, cardCoverFile, userInfo)
    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) { next(error) }
}

const deleteItem = async(req, res, next) => {
  try {
    const cardId = req.params.id
    const result = await cardService.deleteItem(cardId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const cardController = {
  createNew,
  update,
  deleteItem
}
