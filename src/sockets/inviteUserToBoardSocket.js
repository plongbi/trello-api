// Param socket sẽ đc lấy từ thư viện socket.io
export const inviteUserToBoardSocket = (socket) => {
  // Lắng nghe sự kiện mà client emit lên
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
}