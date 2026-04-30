import JWT from 'jsonwebtoken'

// Function tạo mới 1 token
// userInfo: thông tin đính kèm vào token
// secretSignature: chữ ký bí mật
// tokenLife: thời gian sống của token
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) { throw new Error(error) }
}

// Function ktra 1 token hợp lệ ko (token đc tạo đúng với secretSignature ko)
const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature)
  } catch (error) { throw new Error(error) }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}