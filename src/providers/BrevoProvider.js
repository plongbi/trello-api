const SibApiV3Sdk = require('@getbrevo/brevo')
import { env } from '~/config/environment'

// Khởi tạo apiInstance
let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()

// Thay vì truy cập vào thuộc tính authentications, hãy dùng hàm setApiKey
// Số 0 đại diện cho vị trí của API Key trong danh sách cấu hình của Brevo
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, env.BREVO_API_KEY)

const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }
  sendSmtpEmail.to = [{ email: recipientEmail }]
  sendSmtpEmail.subject = customSubject
  sendSmtpEmail.htmlContent = htmlContent

  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}