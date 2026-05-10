export const chatSocket = (socket, io) => {
  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`)
  })

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId)
  })

  socket.on('send_message', ({ message, memberIds }) => {
    // Gửi tin nhắn tới những user đang trong conversation room
    io.to(message.conversationId).emit('receive_message', message)

    // Gửi thông báo có tin nhắn mới cho tất cả thành viên
    if (memberIds && Array.isArray(memberIds)) {
      memberIds.forEach(memberId => {
        io.to(`user_${memberId}`).emit('new_message_notification', message)
      })
    }
  })

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId)
  })
}
