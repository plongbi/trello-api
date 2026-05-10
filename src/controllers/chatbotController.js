import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

const SYSTEM_PROMPT = `Bạn là trợ lý AI thông minh trong ứng dụng Trello. 
Trò chuyện thân thiện, hỗ trợ tiếng Việt, ngắn gọn, súc tích.`

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: SYSTEM_PROMPT
})

const chat = async (req, res) => {
  try {
    const { messages } = req.body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Messages array is required' })
    }

    // Convert format từ OpenAI sang Gemini
    // Lấy 10 tin nhắn cuối để tiết kiệm token
    let formattedHistory = messages.slice(-10, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    // Dọn dẹp: Đảm bảo phần tử đầu tiên luôn là 'user'
    while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
      formattedHistory.shift()
    }

    const lastMessage = messages[messages.length - 1].content

    // Bắt đầu phiên chat
    const chatSession = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7
      }
    })

    const result = await chatSession.sendMessage(lastMessage)
    const reply = result.response.text()

    return res.status(StatusCodes.OK).json({ reply })
  } catch (error) {
    console.error('Gemini Error:', error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message
    })
  }
}

export const chatbotController = { chat }