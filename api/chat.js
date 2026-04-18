import OpenAI from 'openai';
import { systemPrompt } from '../src/prompt.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { messages } = req.body;
  if (!messages) {
    return res.status(400).json({ error: 'Messages required' });
  }

  // Uses strict server-side environment variables
  const apiKey = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: missing API key' });
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  try {
    const formattedMessages = messages.map(m => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.text
    }));
    
    // Server securely holds the system prompt
    const apiMessages = [{ role: 'system', content: systemPrompt }, ...formattedMessages];

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: apiMessages,
    });

    const reply = response.choices[0]?.message?.content || "";
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('API Chat Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
