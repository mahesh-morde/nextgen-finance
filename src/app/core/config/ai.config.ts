export const AI_CONFIG = {
  github: {
    key: 'YOUR_GITHUB_TOKEN_HERE',
    endpoint: 'https://models.inference.ai.azure.com/chat/completions',
    model: 'gpt-4o'
  },
  groq: {
    key: 'YOUR_GROQ_API_KEY_HERE',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama3-70b-8192'
  },
  google: {
    key: 'YOUR_GOOGLE_API_KEY_HERE',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    model: 'gemini-pro'
  },
  cohere: {
    key: 'YOUR_COHERE_API_KEY_HERE',
    endpoint: 'https://api.cohere.ai/v1/generate',
    model: 'command'
  }
};
