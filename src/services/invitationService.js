import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // Người đi mời: chính là người đang request, nên chúng ta tìm theo id lấy từ token
    const inviter = await userModel.findOneById(inviterId)
    // Người được mời: lấy theo email nhận từ phía FE
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
    // Tìm luôn cái board ra để lấy data xử lý
    const board = await boardModel.findOneById(reqBody.boardId)
    // Nếu không tồn tại 1 trong 3 thì cứ thẳng tay reject
    if (!invitee || !inviter || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!')
    }

    // Tạo data cần thiết để lưu vào trong DB
    // Có thể thử bỏ hoặc làm sai lệch type, boardInvitation, status để test xem Model validate ok chưa.
    const newInvitationData = {
      inviterId,
      // chuyển từ ObjectId về String vì sang bên Model có check lại data ở hàm create
      inviteeId: invitee._id.toString(),
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }

    // Gọi sang Model để lưu vào DB
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId.toString())

    // Ngoài thông tin của cái board invitation mới tạo thì trả về đủ cả luôn board, inviter, invitee cho FE thoải mái xử lý.
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }

    return resInvitation
  } catch (error) { throw error }
}

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)

    // Vì các dữ liệu inviter, invitee, board đang là gtri mảng 1 phtu nếu lấy ra đc nên chta biến đổi
    // nó về Json Object trước khi trả về FE
    const resInvitations = getInvitations.map(i => ({
      ...i,
      inviter: i.inviter[0] || {},
      invitee: i.invitee[0] || {},
      board: i.board[0] || {}
    }))

    return resInvitations
  } catch (error) { throw error }
}

const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    // Tìm bản ghi invitation trong model
    const getInvitation = await invitationModel.findOneById(invitationId)
    if (!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!')

    // Sau khi có getInvitation rồi thì lấy full thông tin của board
    const boardId = getInvitation.boardInvitation.boardId
    const getBoard = await boardModel.findOneById(boardId)
    if (!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')

    // Kiểm tra xem nếu status là ACCEPTED join board mà cái thằng user (invitee) đã là owner hoặc member của board rồi thì trả về thông báo lỗi luôn.
    // Note: 2 mảng memberIds và ownerIds của board nó đang là kiểu dữ liệu ObjectId nên cho nó về String hết luôn để check
    const boardOwnerAndMemberIds = [...getBoard.ownerIds, ...getBoard.memberIds]
      .map(id => id.toString()) // 🔥 FIX: tránh lỗi includes sai

    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member of this board!')
    }

    // Tạo dữ liệu để update bản ghi invitation
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status: status // status là ACCEPTED hoặc REJECTED do FE gửi lên
      }
    }

    // B1: update status trong bản ghi invitation
    await invitationModel.update(invitationId, updateData) // 🔥 FIX: không dùng result trả về (có thể null)

    // B2: Nếu TH accept là 1 lời mời thành công thì cần thêm thông tin user(userId) vào bản ghi memberIds trong collection board
    if (status === BOARD_INVITATION_STATUS.ACCEPTED) { // 🔥 FIX: dùng status từ FE thay vì updatedInvitation
      await boardModel.pushMemberIds(boardId, userId)
    }

    // 🔥 FIX: return data ổn định, không phụ thuộc Mongo
    return {
      _id: invitationId,
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status
      }
    }

  } catch (error) { throw error }
}
export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}