import 'dotenv/config'

async function run() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    const response = await fetch(url)
    const data = await response.json()
    const validModels = data.models
      .filter(m => m.supportedGenerationMethods.includes('generateContent'))
      .map(m => m.name)
    console.log(validModels)
  } catch (error) {
    console.error('Error:', error.message)
  }
}

run()
