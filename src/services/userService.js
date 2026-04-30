import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAINS } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const createNew = async(reqBody) => {
  try {
    // Ktra xem email đã tồn tại chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
    }

    // Tạo data lưu vào DB
    // Nếu email là long@gmail.com => lấy đc 'long'
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: await bcryptjs.hashSync(reqBody.password, 8),
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    // Thực hiện lưu thông tin user vào DB
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    // Gửi email cho người dùng verify
    const verificationLink = `${WEBSITE_DOMAINS}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Trello: Please verify your email!'
    const htmlContent = `
      <h3>Here is your verification link:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely,<br/> - Trello Team - </h3>
    `

    // Gọi tới provider gửi mail
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    // Trả dữ liệu cho controller
    return pickUser(getNewUser)
  } catch (error) { throw error }
}

const verifyAccount = async(reqBody) => {
  try {
    // Query user trong DB
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Các bước ktra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account already activated!')
    if (reqBody.token !== existUser.verifyToken) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Invalid token!')

    // Nếu mọi thứ ok => update thông tin user để verify account
    const updateData = {
      isActive: true,
      verifyToken: null
    }

    // Update thông tin user
    const updatedUser = await userModel.update(existUser._id, updateData)

    return pickUser(updatedUser)

  } catch (error) { throw error }
}

const login = async(reqBody) => {
  try {
    // Query user trong DB
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Các bước ktra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your email or password is incorrect!')
    }

    // Nếu mọi thứ ok => tạo token đăng nhập trả về cho FE
    // Tạo thông tin đính kèm trong JWT Token gồm _id và emil của user
    const userInfo = {
      _id: existUser._id,
      email: existUser.email
    }

    // Tạo ra 2 loại token, accessToken và refreshToken trả về cho FE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      env.ACCESS_TOKEN_LIFE
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      // 15
      env.REFRESH_TOKEN_LIFE
    )

    // Trả về thông tin user kèm 2 token vừa tạo
    return { accessToken, refreshToken, ...pickUser(existUser) }

  } catch (error) { throw error }
}

const refreshToken = async(clientRefreshToken) => {
  try {
    // Verify / giải mã cái refresh token xem hợp lệ ko
    const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)

    // Vì chỉ lưu thông tin unique và cố định của user rồi => lấy từ decoded,
    // tiết kiệm query vào DC để lấy data
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    // Tạo accessToken mới
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      env.ACCESS_TOKEN_LIFE // 1h
    )

    return { accessToken }

  } catch (error) { throw error }
}

const update = async (userId, reqBody, userAvatarFile) => {
  try {
    // Query user và ktra cho chắc chắn
    const existUser = await userModel.findOneById(userId)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

    // Khởi tạo kqua updated user ban đầu là empty
    let updatedUser = {}

    // TH change password
    if (reqBody.current_password && reqBody.new_password) {
      // Ktra xem current_password đúng ko
      if (!bcryptjs.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your current password is incorrect!')
      }

      // Nếu current_password đúng => hash 1 cái mk mới và update lại vào DB
      updatedUser = await userModel.update(existUser._id, {
        password: bcryptjs.hashSync(reqBody.new_password, 8)
      })
    } else if (userAvatarFile) {
      // TH upload file lên cloud storage cụ thể là cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')

      // Lưu lại url của file ảnh vào DB
      updatedUser = await userModel.update(existUser._id, {
        avatar: uploadResult.secure_url
      })
    } else {
      // TH update các thông tin chung
      updatedUser = await userModel.update(existUser._id, reqBody)
    }

    return pickUser(updatedUser)
  } catch (error) { throw error }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}