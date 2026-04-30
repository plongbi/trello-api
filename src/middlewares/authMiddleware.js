import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'

// Middleware này đảm nhiệm việc: Xác thực JWT accessToken nhận từ FE có hợp lệ ko
const isAuthorized = async (req, res, next) => {
  // Lấy accessToken từ cookie
  const clientAccessToken = req.cookies?.accessToken

  // Nếu clientAccessToken ko tồn tại thì trả về lỗi
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (Token not found)'))
    return
  }

  try {
    // B1: Giải mã token xem có hợp lệ ko
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    )

    // B2: Nếu hợp lệ thì cần phải lưu thông tin giải mã đc vào req.jwtDecoded, để dùng tầng sau
    req.jwtDecoded = accessTokenDecoded

    // B3: Cho phép request đi tiếp
    next()
  } catch (error) {
    // Nếu accessToken hết hạn thì trả về lỗi 410 - GONE cho FE biết để gọi api rếhToken
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token!'))
      return
    }

    // Nếu accessToken không hợp lệ thì trả về lỗi 401 cho FE gọi api sign_out
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = {
  isAuthorized
}