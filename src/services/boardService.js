/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/coulmnModel'
import { cardModel } from '~/models/cardModel'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'

const createNew = async (userId, reqBody) => {
  try {
    // Xử lý logic dự liệu
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào DB
    const createdBoard = await boardModel.createNew(userId, newBoard)

    // Lấy bản ghi board sau khi gọi
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    return getNewBoard
  } catch (error) { throw error }
}

const getDetails = async (userId, boardId) => {
  try {
    const board = await boardModel.getDetails(userId, boardId)
    if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    // B1: Deep clone board để tránh thay đổi dữ liệu gốc
    const resBoard = cloneDeep(board)
    // B2: Đưa card về đúng column của nó
    resBoard.columns.forEach(column => {
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
    })
    // B3: Xóa mảng cards khỏi board ban đầu
    delete resBoard.cards

    return resBoard
  } catch (error) { throw error }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)
    return updatedBoard
  } catch (error) { throw error }
}

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    // B1: Update cardOrderIds của column ban đầu chứa nó
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })

    // B2: Update cardOrderIds của column tiếp theo
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })

    // B3: Update lại trường coumnId của card đã kéo
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    })

    return { updateResult: 'Sucessfully!' }
  } catch (error) { throw error }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    // Nếu ko tồn tại page hoặc itemsPerPage từ FE thì BE cần gán luôn gtri mặc định
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE
    const results = await boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10))

    return results
  } catch (error) { throw error }
}

const deleteBoard = async (boardId) => {
  try {
    // B1: Xóa Board
    await boardModel.deleteOneById(boardId)

    // B2: Xóa toàn bộ Columns thuộc Board này
    await columnModel.deleteManyByBoardId(boardId)

    // B3: Xóa toàn bộ Cards thuộc Board này
    await cardModel.deleteManyByBoardId(boardId)

    return { deleteResult: 'Board and all its columns/cards deleted successfully!' }
  } catch (error) { throw error }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards,
  deleteBoard
}