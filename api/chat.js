import OpenAI from 'openai';
import { systemPrompt } from '../src/prompt.js';

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_MESSAGES = 20;         // Prevent prompt-injection via huge histories
const MAX_CONTENT_LENGTH = 500;  // Max chars per individual message
const ALLOWED_ROLES = new Set(['user', 'model']);

/**
 * Validates and sanitises the incoming messages array.
 * Returns { valid: true, messages } or { valid: false, error }
 */
function validateMessages(raw) {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { valid: false, error: 'Messages must be a non-empty array.' };
  }
  if (raw.length > MAX_MESSAGES) {
    return { valid: false, error: `Too many messages (max ${MAX_MESSAGES}).` };
  }

  const sanitised = [];
  for (const msg of raw) {
    if (typeof msg !== 'object' || msg === null) {
      return { valid: false, error: 'Each message must be an object.' };
    }
    if (!ALLOWED_ROLES.has(msg.role)) {
      return { valid: false, error: `Invalid role: "${msg.role}". Allowed: user, model.` };
    }
    const content = String(msg.text || '').trim().substring(0, MAX_CONTENT_LENGTH);
    sanitised.push({ role: msg.role, text: content });
  }

  return { valid: true, messages: sanitised };
}

export default async function handler(req, res) {
  // ── Method guard ────────────────────────────────────────────────────────
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ── Input validation ────────────────────────────────────────────────────
  const { messages: rawMessages } = req.body || {};
  const { valid, messages, error: validationError } = validateMessages(rawMessages);
  if (!valid) {
    return res.status(400).json({ error: validationError });
  }

  // ── API key guard (server-side only — never exposed to client) ───────────
  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    console.error('[chat] Missing GROQ_API_KEY environment variable.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  // ── Build OpenAI-compatible client pointing at Groq ──────────────────────
  const client = new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  try {
    // Map UI format → OpenAI format, prepend system prompt
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
        .filter((m) => m.text)
        .map((m) => ({
          role: m.role === 'model' ? 'assistant' : 'user',
          content: m.text,
        })),
    ];

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: apiMessages,
    });

    const reply = response.choices[0]?.message?.content || '';
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('[chat] Groq API error:', error?.status, error?.message);

    // Surface rate-limit errors with a 429 so the client can handle gracefully
    if (error?.status === 429) {
      return res.status(429).json({ error: 'Rate limit reached. Please try again shortly.' });
    }

    return res.status(500).json({ error: 'An error occurred processing your request.' });
  }
}
