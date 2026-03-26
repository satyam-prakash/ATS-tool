// Test Gemini API Key
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = 'AIzaSyBhAgICnPIPL559hxOwWyprfGn_TPTsIRA';

async function testGemini() {
  try {
    console.log('Testing Gemini API key...');

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent('Say hello in 5 words');
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini API key is VALID!');
    console.log('Response:', text);
    process.exit(0);
  } catch (error) {
    console.error('❌ Gemini API key is INVALID!');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testGemini();
