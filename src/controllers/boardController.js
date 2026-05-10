import { StatusCodes } from 'http-status-codes'
import { boardService } from '../services/boardService.js'

const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id

    // Điều hướng dữ liệu sang tầng Service
    const createdBoard = await boardService.createNew(userId, req.body)

    // Có kqua thì trả về Client
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const boardId = req.params.id
    const board = await boardService.getDetails(userId, boardId)
    res.status(StatusCodes.OK).json(board)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const updatedBoard = await boardService.update(boardId, req.body)
    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) { next(error) }
}

const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumn(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    // page va itemsPerPage đc truyền vào trong query url từ FE nên BE lấy thông qua req.query
    const { page, itemsPerPage } = req.query
    const results = await boardService.getBoards(userId, page, itemsPerPage)
    res.status(StatusCodes.OK).json(results)
  } catch (error) { next(error) }
}

const deleteBoard = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const result = await boardService.deleteBoard(boardId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards,
  deleteBoard
}
